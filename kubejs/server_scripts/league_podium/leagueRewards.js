console.info("[MODDCORP] leagueRewards.js loaded");

global.wildBattleMusic = ["moddcorp:wild_battle_full"];
global.legendaryBattleMusic = ["moddcorp:boss_pokemon_battle_full"];
global.trainerBattleMusic = ["moddcorp:trainer_battle_full"];
global.leaderBattleMusic =  ["moddcorp:gym_leader_battle_full"];
global.legendaryPokemon = [
    "articuno", "zapdos", "moltres", "mewtwo",
    "raikou", "entei", "suicune", "lugia", "hooh",
    "regirock", "regice", "registeel", "latias", "latios", "kyogre", "groudon", "rayquaza",
    "uxie", "mesprit", "azelf", "dialga", "palkia", "heatran", "regigigas", "giratina", "cresselia",
    "cobalion", "terrakion", "virizion", "tornadus", "thundurus", "landorus", "reshiram", "zekrom", "kyurem",
    "xerneas", "yveltal", "zygarde",
    "typenull", "silvally", "tapukoko", "tapulele", "tapubulu", "tapufini",
    "cosmog", "cosmoem", "solgaleo", "lunala", "necrozma",
    "zacian", "zamazenta", "eternatus", "kubfu", "urshifu", "regieleki", "regidrago",
    "glastrier", "spectrier", "calyrex", "enamorus",
    "wochien", "chienpao", "tinglu", "chiyu", "koraidon", "miraidon",
    "ogerpon", "terapagos", "okidogi", "munkidori", "fezandipiti"
];

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

global.runMusicForWildEncounter = function(player, battle) {
    let isLegendary = false;
    battle.getActors().forEach((actor) => {
        if (String(actor.getType()) !== "WILD") return;
        actor.getPokemonList().forEach((battlePokemon) => {
            let species = String(battlePokemon.originalPokemon.species.resourceIdentifier.path);
            if (global.legendaryPokemon.includes(species)) isLegendary = true;
        });
    });

    let musicList = isLegendary ? global.legendaryBattleMusic : global.wildBattleMusic;
    let music = musicList[Math.floor(Math.random() * musicList.length)];
    Utils.server.runCommandSilent("stopsound " + player.username + " music");
    Utils.server.runCommandSilent("stopsound " + player.username + " record");
    Utils.server.runCommandSilent("execute at " + player.username + " run playsound " + music + " record " + player.username + " ~ ~ ~");
};

global.runMusicForLeagueEncounter = function(player, encounterId) {

    let encounter = global.leagueConfig[encounterId];

    if (!encounter) //Play default music if no encounter is found
        return false;

    let command;

    command = global.expandLeagueCommand("stopsound %player% music", player, encounterId);
    Utils.server.runCommandSilent(command);
    command = global.expandLeagueCommand("stopsound %player% record", player, encounterId);
    Utils.server.runCommandSilent(command);
    
    if (encounter.battle_music && encounter.battle_music.length > 0) {
        let music = encounter.battle_music[Math.floor(Math.random() * encounter.battle_music.length)];
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