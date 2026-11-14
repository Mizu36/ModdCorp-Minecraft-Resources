console.info("[MODDCORP] gymGauntlet.js loaded");

const gymGauntletRounds = [
    { npcId: "gym_leader_bug_shino", model: "humanoid", encounterId: "bug_leader_gauntlet" },
    { npcId: "gym_leader_ground_ashley", model: "humanoid_slim", encounterId: "ground_leader_gauntlet" },
    { npcId: "gym_leader_water_kamiya", model: "humanoid_slim", encounterId: "water_leader_gauntlet" },
    { npcId: "gym_leader_poison_kinoko", model: "humanoid_slim", encounterId: "poison_leader_gauntlet" },
    { npcId: "gym_leader_fire_tim", model: "humanoid", encounterId: "fire_leader_gauntlet" },
    { npcId: "gym_leader_electric_voltaire", model: "humanoid", encounterId: "electric_leader_gauntlet" },
    { npcId: "gym_leader_ice_glacia", model: "humanoid_slim", encounterId: "ice_leader_gauntlet" },
    { npcId: "gym_leader_normal_maddie", model: "humanoid_slim", encounterId: "normal_leader_gauntlet" },
];

const GAUNTLET_DATA_KEY = "moddcorp_gym_gauntlet";
const GAUNTLET_HOST_PRESET = "easy_npc:preset/humanoid/gym_gauntlet.npc.nbt";
const GauntletUUID = Java.loadClass("java.util.UUID");
const GauntletResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation");
const GauntletBattleRegistry = Java.loadClass("com.cobblemon.mod.common.battles.BattleRegistry").INSTANCE;
const GauntletComponent = Java.loadClass("net.minecraft.network.chat.Component");
const gymGauntletOffers = {};

function readGymGauntlet(server) {
    let data = server.persistentData;
    return data.contains(GAUNTLET_DATA_KEY) ? JSON.parse(String(data.getString(GAUNTLET_DATA_KEY))) : null;
}

function saveGymGauntlet(server, state) {
    server.persistentData.putString(GAUNTLET_DATA_KEY, JSON.stringify(state));
}

function gauntletPlayer(server, uuid) {
    return server.getPlayerList().getPlayer(GauntletUUID.fromString(uuid));
}

function gauntletBattleActive(uuid) {
    return GauntletBattleRegistry.getBattleByParticipatingPlayerId(GauntletUUID.fromString(uuid)) != null;
}

function showGauntletDialog(server, player, dialogId) {
    if (Number(server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} ${dialogId}`)) < 1) {
        console.error(`[GYM GAUNTLET] Could not show dialog ${dialogId} for ${player.username}.`);
        player.tell("§cCould not open the Gym Gauntlet dialog. Check the server log.");
        return false;
    }
    return true;
}

function replaceGauntletPreset(server, state, preset) {
    const level = server.getLevel(new GauntletResourceLocation(state.dimension));
    const npc = level && level.getEntity(GauntletUUID.fromString(state.uuid));
    if (!npc) return false;
    state.x = Number(npc.x);
    state.y = Number(npc.y);
    state.z = Number(npc.z);
    saveGymGauntlet(server, state);
    const result = server.runCommandSilent(`execute in ${state.dimension} run easy_npc preset import custom ${preset} ${state.x} ${state.y} ${state.z} ${state.uuid}`);
    if (Number(result) < 1) {
        console.error(`[GYM GAUNTLET] Failed to import ${preset} for ${state.uuid}; use /moddcorpgymgauntlet reset after fixing the preset.`);
        state.phase = "error";
        saveGymGauntlet(server, state);
        return false;
    }
    return true;
}

function validateGymGauntletRounds(player) {
    for (const round of gymGauntletRounds) {
        if (!global.leagueConfig[round.encounterId] || !global.leagueConfig[round.encounterId].trainerId) {
            player.tell("§cThe Gym Gauntlet has an invalid opponent configuration. Check the server log.");
            console.error("[GYM GAUNTLET] Invalid round configuration: " + JSON.stringify(round));
            return false;
        }
    }
    return true;
}

function gauntletRound(state) {
    return state.order && gymGauntletRounds[state.order[state.round]];
}

function gauntletPreset(round) {
    return `easy_npc:preset/${round.model}/${round.npcId}.npc.nbt`;
}

function showRoundDialog(server, state, suffix, delay) {
    const owner = state.owner;
    const runId = state.runId;
    const roundIndex = state.round;
    const phase = state.phase;
    server.scheduleInTicks(delay, () => {
        const current = readGymGauntlet(server);
        if (!current || current.runId !== runId || current.owner !== owner || current.round !== roundIndex || current.phase !== phase) return;
        const player = gauntletPlayer(server, owner);
        const round = gauntletRound(current);
        if (!player || !round) {
            current.phase = "aborting";
            saveGymGauntlet(server, current);
            return;
        }
        if (!showGauntletDialog(server, player, `${round.npcId}_gauntlet_${suffix}`)) {
            current.phase = "error";
            saveGymGauntlet(server, current);
        }
    });
}

global.isGymGauntletLocked = (server, target) => {
    const state = readGymGauntlet(server);
    return !!state && state.phase !== "idle" && state.uuid === String(target.getUuid());
};

global.handleGymGauntletInteraction = (server, target, player) => {
    const state = readGymGauntlet(server);
    if (!state || state.uuid !== String(target.getUuid())) return false;
    const playerId = String(player.getUuid());
    if (state.phase !== "idle") {
        player.tell("§eThe Gym Gauntlet is currently in use.");
    } else if (!player.stages.has("e4_complete")) {
        player.tell("§cYou must complete the Elite Four before challenging the Gym Gauntlet.");
    } else if (validateGymGauntletRounds(player)) {
        gymGauntletOffers[playerId] = Date.now();
        showGauntletDialog(server, player, "gym_gauntlet_choice_dialog");
    }
    return true;
};

function startGymGauntletBattle(server, player) {
    const state = readGymGauntlet(server);
    const playerId = String(player.getUuid());
    const round = state && gauntletRound(state);
    if (!state || state.owner !== playerId || state.phase !== "intro" || !round) {
        player.tell("§cThat is not the current Gym Gauntlet battle.");
        return false;
    }
    if (gauntletBattleActive(playerId)) {
        player.tell("§cYou are already in a battle.");
        state.phase = "aborting";
        saveGymGauntlet(server, state);
        return false;
    }
    const party = global.getPlayerParty(player);
    let healthy = false;
    if (party) party.forEach(pokemon => { if (pokemon.getCurrentHealth() > 0) healthy = true; });
    if (!healthy) {
        player.tell("§cYou need a healthy Pokémon to challenge the Gym Gauntlet.");
        state.phase = "aborting";
        saveGymGauntlet(server, state);
        return false;
    }
    const encounterId = round.encounterId;
    const trainerId = global.leagueConfig[encounterId].trainerId;
    state.phase = "starting";
    saveGymGauntlet(server, state);
    global.pendingNpcBattles[playerId] = { encounterId: encounterId, trainerId: trainerId, requestedAt: Date.now(), started: false, gymGauntlet: true };
    if (Number(server.runCommandSilent(`trainers makebattle ${player.username} ${trainerId} ${state.uuid}`)) < 1) {
        delete global.pendingNpcBattles[playerId];
        state.phase = "aborting";
        saveGymGauntlet(server, state);
        console.error("[GYM GAUNTLET] Could not start battle against " + trainerId);
        player.tell("§cThe Gym Gauntlet battle could not be started.");
        return false;
    }
    return true;
}

global.finishGymGauntletBattle = (server, player, won) => {
    const state = readGymGauntlet(server);
    if (state && state.owner === String(player.getUuid()) && state.phase === "aborting") return;
    if (!state || state.owner !== String(player.getUuid()) || state.phase !== "starting") {
        console.error("[GYM GAUNTLET] Battle ended without a matching active run.");
        return;
    }
    const round = gauntletRound(state);
    if (!round) {
        state.phase = "aborting";
        saveGymGauntlet(server, state);
        player.tell("§cThe Gym Gauntlet configuration changed; the run is being cancelled.");
        return;
    }
    state.phase = "result";
    state.won = won;
    saveGymGauntlet(server, state);
    showRoundDialog(server, state, won ? "win" : "loss", 40);
};

ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event;
    event.register(
        Commands.literal("moddcorpgymgauntlet")
            .then(Commands.literal("create").requires(src => src.hasPermission(2)).executes(ctx => {
                const player = ctx.source.player;
                const server = ctx.source.server;
                if (!player) return 0;
                if (readGymGauntlet(server)) {
                    player.tell("§cThe Gym Gauntlet NPC is already registered. If it was deleted, run /moddcorpgymgauntlet forget first.");
                    return 0;
                }
                const state = { uuid: String(GauntletUUID.randomUUID()), dimension: String(player.level.dimension),
                    x: Number(player.x), y: Number(player.y), z: Number(player.z), phase: "idle" };
                const result = server.runCommandSilent(`execute in ${state.dimension} run easy_npc preset import custom ${GAUNTLET_HOST_PRESET} ${state.x} ${state.y} ${state.z} ${state.uuid}`);
                if (Number(result) < 1) {
                    player.tell("§cCould not create the Gym Gauntlet NPC. Check the server log.");
                    return 0;
                }
                saveGymGauntlet(server, state);
                player.tell("§aCreated Gym Gauntlet NPC: " + state.uuid);
                return 1;
            }))
            .then(Commands.literal("start").executes(ctx => {
                const player = ctx.source.player;
                if (!player) return 0;
                const server = ctx.source.server;
                const state = readGymGauntlet(server);
                const playerId = String(player.getUuid());
                if (!gymGauntletOffers[playerId] || Date.now() - gymGauntletOffers[playerId] > 60000) {
                    player.tell("§cTalk to the Gym Gauntlet NPC first.");
                    return 0;
                }
                delete gymGauntletOffers[playerId];
                if (!state || state.phase !== "idle" || !validateGymGauntletRounds(player)) {
                    player.tell("§cThe Gym Gauntlet is unavailable.");
                    return 0;
                }
                if (!player.stages.has("e4_complete")) {
                    player.tell("§cYou must complete the Elite Four before challenging the Gym Gauntlet.");
                    return 0;
                }
                if (gauntletBattleActive(playerId)) {
                    player.tell("§cYou are already in a battle.");
                    return 0;
                }
                state.owner = playerId;
                state.runId = String(GauntletUUID.randomUUID());
                state.order = gymGauntletRounds.map((_, index) => index);
                let swapIndex, swapValue;
                for (let i = state.order.length - 1; i > 0; i--) {
                    swapIndex = Math.floor(Math.random() * (i + 1));
                    swapValue = state.order[i];
                    state.order[i] = state.order[swapIndex];
                    state.order[swapIndex] = swapValue;
                }
                state.round = 0;
                state.phase = "intro";
                saveGymGauntlet(server, state);
                if (!replaceGauntletPreset(server, state, gauntletPreset(gauntletRound(state)))) {
                    player.tell("§cCould not load the Gym Gauntlet opponent. Ask an administrator to reset it.");
                    if (state.phase !== "error") state.phase = "aborting";
                    saveGymGauntlet(server, state);
                    return 0;
                }
                showRoundDialog(server, state, "challenge", 10);
                return 1;
            }))
            .then(Commands.literal("battle").executes(ctx => {
                const player = ctx.source.player;
                return player && startGymGauntletBattle(ctx.source.server, player) ? 1 : 0;
            }))
            .then(Commands.literal("continue").executes(ctx => {
                const player = ctx.source.player;
                if (!player) return 0;
                const state = readGymGauntlet(ctx.source.server);
                if (!state || state.phase !== "result" || state.owner !== String(player.getUuid())) return 0;
                state.phase = state.won ? "advancing" : "aborting";
                saveGymGauntlet(ctx.source.server, state);
                return 1;
            }))
            .then(Commands.literal("forget").requires(src => src.hasPermission(2)).executes(ctx => {
                var forgetServer = ctx.source.server;
                var old = readGymGauntlet(forgetServer);
                if (!old) {
                    ctx.source.sendFailure(GauntletComponent.literal("No Gym Gauntlet NPC is registered."));
                    return 0;
                }
                if (old.owner) delete global.pendingNpcBattles[old.owner];
                forgetServer.persistentData.remove(GAUNTLET_DATA_KEY);
                ctx.source.sendSuccess(() => GauntletComponent.literal("Gym Gauntlet registration cleared. Delete the old NPC if it still exists, then run create."), true);
                return 1;
            }))
            .then(Commands.literal("reset").requires(src => src.hasPermission(2)).executes(ctx => {
                const state = readGymGauntlet(ctx.source.server);
                if (!state) return 0;
                state.phase = "aborting";
                saveGymGauntlet(ctx.source.server, state);
                return 1;
            }))
    );
});

PlayerEvents.loggedOut(event => {
    delete gymGauntletOffers[String(event.player.getUuid())];
    const state = readGymGauntlet(event.player.server);
    if (state && state.phase !== "idle" && state.owner === String(event.player.getUuid())) {
        state.phase = "aborting";
        saveGymGauntlet(event.player.server, state);
    }
});

ServerEvents.loaded(event => {
    const state = readGymGauntlet(event.server);
    if (state && state.phase !== "idle") {
        state.phase = "aborting";
        saveGymGauntlet(event.server, state);
    }
});

let gymGauntletTicks = 0;
ServerEvents.tick(event => {
    if (++gymGauntletTicks % 20 !== 0) return;
    const server = event.server;
    const state = readGymGauntlet(server);
    if (state && state.phase === "starting" && state.owner) {
        var pending = global.pendingNpcBattles[state.owner];
        if (pending && !pending.started && Date.now() - pending.requestedAt > 10000 && !gauntletBattleActive(state.owner)) {
            delete global.pendingNpcBattles[state.owner];
            state.phase = "aborting";
            saveGymGauntlet(server, state);
            var timedOutPlayer = gauntletPlayer(server, state.owner);
            if (timedOutPlayer) timedOutPlayer.tell("§cThe Gym Gauntlet battle did not start. The run is being cancelled.");
            console.error("[GYM GAUNTLET] Battle did not start for " + state.owner);
        }
    }
    if (!state || (state.phase !== "advancing" && state.phase !== "aborting")) return;
    if (state.owner && gauntletBattleActive(state.owner)) return;
    const player = state.owner ? gauntletPlayer(server, state.owner) : null;
    if (state.phase === "advancing" && !player) state.phase = "aborting";
    if (state.phase === "advancing") {
        var next = state.round + 1;
        if (next < gymGauntletRounds.length) {
            var party = global.getPlayerParty(player);
            if (!party) {
                player.tell("§cCould not heal your Pokémon. Ask an administrator to reset the Gym Gauntlet.");
                console.error("[GYM GAUNTLET] Could not access the challenger's Pokémon party.");
                state.phase = "error";
                saveGymGauntlet(server, state);
                return;
            }
            party.forEach(pokemon => pokemon.heal());
            state.round = next;
            state.phase = "intro";
            var round = gauntletRound(state);
            if (!round) {
                state.phase = "aborting";
                saveGymGauntlet(server, state);
                player.tell("§cThe Gym Gauntlet order is invalid; the run is being cancelled.");
                return;
            }
            if (!replaceGauntletPreset(server, state, gauntletPreset(round))) return;
            saveGymGauntlet(server, state);
            showRoundDialog(server, state, "challenge", 10);
            return;
        }
    }
    if (!replaceGauntletPreset(server, state, GAUNTLET_HOST_PRESET)) return;
    if (player && state.phase === "advancing") {
        player.stages.add("gym_leader_rematch_gauntlet_complete");
        player.tell("§aYou completed the Gym Gauntlet!");
    }
    if (state.owner) {
        var remainingBattle = global.pendingNpcBattles[state.owner];
        if (remainingBattle && remainingBattle.gymGauntlet) delete global.pendingNpcBattles[state.owner];
    }
    state.phase = "idle";
    delete state.owner;
    delete state.runId;
    delete state.order;
    delete state.round;
    delete state.won;
    saveGymGauntlet(server, state);
});
