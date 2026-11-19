console.info("[MODDCORP] playerBattleLevelCap.js loaded");

const LevelCapCobblemon = Java.loadClass("com.cobblemon.mod.common.Cobblemon");
const LevelCapRegistry = Java.loadClass("com.cobblemon.mod.common.battles.BattleRegistry").INSTANCE;
const LevelCapComponent = Java.loadClass("net.minecraft.network.chat.Component");
const LevelCapObjects = Java.loadClass("java.util.Objects");
const LevelCapCompoundTag = Java.loadClass("net.minecraft.nbt.CompoundTag");
const LevelCapBattleExperienceSource = Java.loadClass("com.cobblemon.mod.common.api.pokemon.experience.BattleExperienceSource");
const LevelCapPartyReferencePacket = Java.loadClass("com.cobblemon.mod.common.net.messages.client.storage.party.SetPartyReferencePacket");
const LEVEL_CAP_BACKUP = "moddcorp_level_cap_backup";

global.activePlayerLevelCaps = global.activePlayerLevelCaps || {};

function levelCapParty(player) {
    return LevelCapCobblemon.INSTANCE.getStorage().getParty(player.getUuid()).toGappyList();
}

function levelCapBackup(pokemon) {
    var data = pokemon.getPersistentData();
    if (!data.contains(LEVEL_CAP_BACKUP)) return null;
    var backup = data.getCompound(LEVEL_CAP_BACKUP);
    var uuid = String(backup.getString("uuid"));
    var level = Number(backup.getInt("level"));
    var experience = Number(backup.getInt("experience"));
    var cap = Number(backup.getInt("cap"));
    if (uuid !== String(pokemon.getUuid()) || level < 1 || level > 100 || cap < 1 || cap >= level ||
        experience < 0 || Number(pokemon.getExperienceGroup().getLevel(experience)) !== level) {
        throw new Error("Invalid level-cap backup for Pokémon " + pokemon.getUuid());
    }
    return { level: level, experience: experience, cap: cap };
}

global.restorePlayerLevelCap = (player, syncClient) => {
    if (LevelCapRegistry.getBattleByParticipatingPlayerId(player.getUuid()) != null) {
        player.tell("§cCannot restore Pokémon while you are in a battle.");
        return false;
    }
    try {
        var partyStore = LevelCapCobblemon.INSTANCE.getStorage().getParty(player.getUuid());
        var party = partyStore.toGappyList();
        var needsHealing = false;
        var restored = 0;
        for (var i = 0; i < party.size(); i++) {
            var pokemon = party.get(i);
            if (!pokemon) continue;
            var backup = levelCapBackup(pokemon);
            if (!backup) continue;
            var currentLevel = Number(pokemon.getLevel());
            var currentExperience = Number(pokemon.getExperience());
            if (currentLevel > backup.level || (currentLevel === backup.level && currentExperience >= backup.experience)) continue;
            if (currentExperience > backup.experience) {
                throw new Error("Current experience exceeds the backup for Pokémon " + pokemon.getUuid());
            }
            // Setting level 100 can reset EXP, so restore the exact EXP afterward.
            if (currentLevel !== backup.level) pokemon.setLevel(backup.level);
            pokemon.setExperienceAndUpdateLevel(backup.experience);
            if (Number(pokemon.getLevel()) !== backup.level || Number(pokemon.getExperience()) !== backup.experience) {
                throw new Error("Restoration verification failed for Pokémon " + pokemon.getUuid());
            }
            needsHealing = true;
            restored++;
        }
        var active = global.activePlayerLevelCaps[String(player.getUuid())];
        if (active) needsHealing = true;
        if (needsHealing) {
            for (var j = 0; j < party.size(); j++) {
                var member = party.get(j);
                if (member) member.heal();
            }
            if (syncClient !== false) {
                // sendTo initializes a new client store; point the player's party UI at it.
                partyStore.sendTo(player);
                new LevelCapPartyReferencePacket(partyStore.getUuid()).sendToPlayer(player);
            }
            console.info(`[LEVEL CAP] Restored ${restored} Pokémon for ${player.username} and healed their party.`);
        }
        delete global.activePlayerLevelCaps[String(player.getUuid())];
        return true;
    } catch (error) {
        console.error("[LEVEL CAP] Recovery failed for " + player.username + ": " + error);
        player.tell("§cPokémon level recovery failed. Contact an administrator and check the server log.");
        return false;
    }
};

function levelCapEncounter(battle, player) {
    var hasNpc = false;
    battle.getActors().forEach(actor => { if (String(actor.getType()) === "NPC") hasNpc = true; });
    if (!hasNpc) return null;
    var pending = global.pendingNpcBattles && global.pendingNpcBattles[String(player.getUuid())];
    if (pending && Date.now() - pending.requestedAt <= 10000) return pending.encounterId;
    var encounterId = null;
    battle.getActors().forEach(actor => {
        if (String(actor.getType()) !== "NPC") return;
        var entity = actor.getEntity ? actor.getEntity() : null;
        if (entity && String(entity.type) === "rctmod:trainer" && entity.persistentData.encounterId) {
            encounterId = String(entity.persistentData.encounterId);
        }
    });
    return encounterId;
}

global.preparePlayerLevelCapBattle = event => {
    var battle = event.battle;
    var players = battle.getPlayers();
    try {
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (!global.restorePlayerLevelCap(player)) throw new Error("Previous recovery is incomplete.");
        }
        if (players.length !== 1) {
            for (var n = 0; n < players.length; n++) {
                var multiId = levelCapEncounter(battle, players[n]);
                var multiEncounter = multiId && global.leagueConfig && global.leagueConfig[multiId];
                if (multiEncounter && multiEncounter.maxPlayerLevel != null) {
                    throw new Error("Level-capped encounters require exactly one player.");
                }
            }
            return true;
        }
        var player = players[0];
        var encounterId = levelCapEncounter(battle, player);
        var encounter = encounterId && global.leagueConfig && global.leagueConfig[encounterId];
        if (!encounter || encounter.maxPlayerLevel === undefined || encounter.maxPlayerLevel === null) return true;
        var cap = Number(encounter.maxPlayerLevel);
        if (!Number.isInteger(cap) || cap < 1 || cap > 100) throw new Error("Invalid maxPlayerLevel for " + encounterId);

        var party = levelCapParty(player);
        var partyById = {};
        for (var j = 0; j < party.size(); j++) {
            var pokemon = party.get(j);
            if (pokemon) partyById[String(pokemon.getUuid())] = pokemon;
        }
        var playerActors = 0;
        battle.getActors().forEach(actor => {
            if (String(actor.getType()) !== "PLAYER") return;
            playerActors++;
            actor.pokemonList.forEach(bp => {
                var original = bp.originalPokemon;
                var member = partyById[String(original.getUuid())];
                if (!member || !LevelCapObjects.equals(member, original) || !LevelCapObjects.equals(member, bp.effectedPokemon)) {
                    throw new Error("Player battle Pokémon does not reference its party Pokémon.");
                }
            });
        });
        if (playerActors !== 1) throw new Error("Expected one player battle actor.");

        global.activePlayerLevelCaps[String(player.getUuid())] = {
            battleId: String(battle.getBattleId()), encounterId: String(encounterId), startedAt: Date.now()
        };
        for (var k = 0; k < party.size(); k++) {
            var pokemon = party.get(k);
            if (!pokemon || Number(pokemon.getLevel()) <= cap) continue;
            var level = Number(pokemon.getLevel());
            var experience = Number(pokemon.getExperience());
            if (Number(pokemon.getExperienceGroup().getLevel(experience)) !== level) {
                throw new Error("Level and experience disagree for Pokémon " + pokemon.getUuid());
            }
            var previous = levelCapBackup(pokemon);
            if (!previous || previous.level !== level || previous.experience !== experience) {
                var backup = new LevelCapCompoundTag();
                backup.putString("uuid", String(pokemon.getUuid()));
                backup.putInt("level", level);
                backup.putInt("experience", experience);
                backup.putInt("cap", cap);
                pokemon.getPersistentData().put(LEVEL_CAP_BACKUP, backup);
            }
            var health = Number(pokemon.getCurrentHealth());
            pokemon.setLevel(cap);
            if (health > 0 && Number(pokemon.getCurrentHealth()) === 0) pokemon.setCurrentHealth(1);
        }
        return true;
    } catch (error) {
        event.setReason(LevelCapComponent.literal("Pokémon level-cap preparation failed. Check the server log."));
        event.cancel();
        console.error("[LEVEL CAP] Battle preparation failed: " + error);
        for (var p = 0; p < players.length; p++) {
            players[p].tell("§cBattle cancelled: Pokémon level recovery or preparation failed.");
            if (global.activePlayerLevelCaps[String(players[p].getUuid())]) {
                global.restorePlayerLevelCap(players[p]);
            }
        }
        return false;
    }
};

StartupEvents.postInit(() => {
    var events = Java.loadClass("com.cobblemon.mod.common.api.events.CobblemonEvents");
    events.EXPERIENCE_GAINED_EVENT_PRE.subscribe("normal", event => {
        var source = event.getSource();
        if (!(source instanceof LevelCapBattleExperienceSource)) return;
        var battle = source.getBattle();
        var players = battle.getPlayers();
        for (var i = 0; i < players.length; i++) {
            var active = global.activePlayerLevelCaps[String(players[i].getUuid())];
            if (active && active.battleId === String(battle.getBattleId())) {
                event.cancel();
                return;
            }
        }
    });
    events.DATA_SYNCHRONIZED.subscribe("normal", player => {
        global.restorePlayerLevelCap(player);
    });
});
