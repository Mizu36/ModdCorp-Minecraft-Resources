console.info("[LEAGUE] leagueRewards.js loaded");

global.trainerBattleMusic = ["sunlit:rby_trainer_battle", "sunlit:sgc_johto_trainer_battle", "sunlit:sgc_kanto_trainer_battle", "sunlit:rse_trainer_battle", "sunlit:frlg_trainer_battle", "sunlit:colosseum_trainer_battle_01", "sunlit:colosseum_trainer_battle_02", "sunlit:xd_trainer_battle", "sunlit:dpp_trainer_battle", "sunlit:hgss_johto_trainer_battle", "sunlit:hgss_kanto_trainer_battle", "sunlit:bw_trainer_battle", "sunlit:xy_trainer_battle", "sunlit:oras_trainer_battle", "sunlit:sm_trainer_battle", "sunlit:swsh_trainer_battle", "sunlit:sv_trainer_battle", "sunlit:champions_trainer_battle"];
//global.trainerBattleMusic = ["sunlit:ado_battle_full", "sunlit:metaphor_battle_full"];
global.leaderBattleMusic = ["sunlit:kanto_leader_battle", "sunlit:johto_leader_battle", "sunlit:hoenn_leader_battle", "sunlit:sinnoh_leader_battle", "sunlit:unova_leader_battle", "sunlit:kalos_leader_battle", "sunlit:alola_leader_battle", "sunlit:galar_leader_battle", "sunlit:paldea_leader_battle"];

//==================================================
// Expand command placeholders
//==================================================

global.expandLeagueCommand = function(command, player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter)
        return command;

    command = command.split("%player%").join(player.username);
    command = command.split("%trainer%").join(encounter.displayName);
    command = command.split("%encounter%").join(encounterId);

    return command;

};

global.runMusicForEncounter = function(player){
    let music = getRandomSong(false);
    Utils.server.runCommandSilent("stopsound " + player.username + " music");
    Utils.server.runCommandSilent("stopsound " + player.username + " record");
    Utils.server.runCommandSilent("execute at " + player.username + " run playsound " + music + " record " + player.username + " ~ ~ ~");
}

global.runMusicForLeagueEncounter = function(player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter) //Play default music if no encounter is found
        return false;

    let command;

    command = global.expandLeagueCommand("stopsound %player% music", player, encounterId);
    Utils.server.runCommandSilent(command);
    command = global.expandLeagueCommand("stopsound %player% record", player, encounterId);
    Utils.server.runCommandSilent(command);
    
    if (encounter.battle_music) {
        let music;
        if (encounter.battle_music.length > 1)
            music = encounter.battle_music[Math.floor(Math.random() * encounter.battle_music.length)];
        else if (encounter.battle_music.length === 1)
            music = encounter.battle_music[0];
        
        command = global.expandLeagueCommand("execute at %player% run playsound " + music + " record %player% ~ ~ ~", player, encounterId);
        Utils.server.runCommandSilent(command);
    } else {
        let music = getRandomSong(encounter.isLeader);
        command = global.expandLeagueCommand("execute at %player% run playsound " + music + " record %player% ~ ~ ~", player, encounterId);
        Utils.server.runCommandSilent(command);
    }
}

//==================================================
// Reward a league encounter
//==================================================

global.rewardLeagueEncounter = function(player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter)
        return false;

    let commands = [];

    if (encounter.isLeader) {
        commands.push(global.expandLeagueCommand("execute at %player% run playsound minecraft:ui.toast.challenge_complete master %player% ~ ~ ~", player, encounterId));
        commands.push(global.expandLeagueCommand("tellraw %player% {\"text\":\"You defeated %trainer%!\",\"color\":\"gold\"}", player, encounterId));
        commands.push(global.expandLeagueCommand("say %player% has defeated %trainer%!", player, encounterId));
    }

    //==============================================
    // Run commands
    //==============================================

    if (encounter.onVictory) {

        for (let i = 0; i < encounter.onVictory.length; i++) {
            let command = encounter.onVictory[i];
            commands.push(global.expandLeagueCommand(command, player, encounterId));
        }

        for (let i = 0; i < commands.length; i++) {
            let command = commands[i];
            Utils.server.runCommandSilent(command);
        }

    }

    //==============================================
    // Give stages
    //==============================================

    if (encounter.rewardStages) {

        for (let i = 0; i < encounter.rewardStages.length; i++) {

            let stage = encounter.rewardStages[i];

            player.stages.add(stage);

            console.info("[LEAGUE] Added stage " + stage);

        }

    }

    //==============================================
    // Remove stages
    //==============================================

    if (encounter.removeStages) {

        for (let i = 0; i < encounter.removeStages.length; i++) {
            let stage = encounter.removeStages[i];

            player.stages.remove(stage);

            console.info("[LEAGUE] Removed stage " + stage);

        }

    }

    //==============================================
    // Give items
    //==============================================

    if (encounter.rewardItems) {

        for (let i = 0; i < encounter.rewardItems.length; i++) {

            let item = encounter.rewardItems[i];

            player.give(
                Item.of(item.id, item.count)
            );

            console.info("[LEAGUE] Gave " + item.count + "x " + item.id);

        }

    }

    //==============================================
    // Run optional function
    //==============================================

    if (encounter.rewardFunction)
        Utils.server.runCommandSilent("execute as " + player.username + " run function " + encounter.rewardFunction);

    return true;

};

global.getLeagueEncounter = function(trainer) {

    if (!trainer)
        return null;

    let encounterId = trainer.persistentData.encounterId;

    if (!encounterId)
        return null;

    return global.leagueConfig[encounterId];

};

global.handleLeagueBattleStart = function(player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter)
        return false;

    if (encounter.onBattleStart) {

        for (let i = 0; i < encounter.onBattleStart.length; i++) {

            let command = encounter.onBattleStart[i];

            command = global.expandLeagueCommand(command, player, encounterId);

            Utils.server.runCommandSilent(command);

        }

    }

    return true;

};

global.handleLeagueBattleEnd = function(player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter)
        return false;

    Utils.server.runCommandSilent(
        global.expandLeagueCommand("stopsound %player% record", player, encounterId)
    );

    if (encounter.onBattleEnd) {

        for (let i = 0; i < encounter.onBattleEnd.length; i++) {

            let command = encounter.onBattleEnd[i];

            command = global.expandLeagueCommand(
                command,
                player,
                encounterId
            );

            Utils.server.runCommandSilent(command);

        }

    }

    return true;

};

global.handleLeagueLoss = function(player, amount) {

    let account = global.getPersonalOrCurioAccount(
        player.level,
        player
    );

    let balance = account.getBalance() || 0;

    if (balance < amount) {

        const UUID = player.getUuid();
        let server = player.getServer();

        if (!server.persistentData.debts)
            server.persistentData.debts = [];

        let found = false;

        for (let i = 0; i < server.persistentData.debts.length; i++) {

            let debt = server.persistentData.debts[i];

            if (String(debt.uuid) === String(UUID)) {

                debt.amount = Number(debt.amount) + amount;
                found = true;
                break;

            }

        }

        if (!found) {

            server.persistentData.debts.push({
                uuid: UUID.toString(),
                amount: amount
            });

        }

    } else {

        account.setBalance(balance - amount);

    }

    player.getServer().runCommandSilent(
        global.getEmbersTextAPICommand(
            player.username,
            `{anchor:"TOP_LEFT",background:1,color:"#FFFFFF",size:1,offsetY:36,offsetX:6,typewriter:1,align:"TOP_LEFT"}`,
            160,
            Text.translatable(
                "sunlit_cobblemon.loss.fee",
                global.formatPrice(amount.toFixed())
            ).toJson()
        )
    );

};

function getRandomSong(isLeader){
    if (isLeader) {
        return global.leaderBattleMusic[Math.floor(Math.random() * global.leaderBattleMusic.length)];
    } else {
        return global.trainerBattleMusic[Math.floor(Math.random() * global.trainerBattleMusic.length)];
    }
}