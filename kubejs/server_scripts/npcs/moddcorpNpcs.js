global.handleNpcNurse = (e, level, server, player) => {
    server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} nurse_choice_dialog_need_to_heal`);
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event;

  event.register(
    Commands.literal("nurseadvice")
      .executes(ctx => {
        const player = ctx.source.player;

        if (!player) return 0;

        global.showNpcNurseAdvice(ctx.source.server, player);
        return 1;
      })
  );

  event.register(
    Commands.literal("nurseheal")
      .executes(ctx => {
        const player = ctx.source.player;

        if (!player) return 0;

        const server = ctx.source.server;
        server.runCommandSilent(`healpokemon ${player.username}`);
        server.runCommandSilent(`playsound sunlit:healing player ${player.username} ${player.x} ${player.y} ${player.z} 1 1`);
        server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} nurse_unique_healed`);
        return 1;
      })
  );
});

global.showNpcNurseAdvice = (server, player) => {
  const stage = getCurrentStage(player);
  const variation = getRandomInt(0, 4);
  server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} nurse_unique_advice_stage_${stage}_${variation}`);
};

global.handleNpcClerk = (e, level, server, player) => {
    server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} clerk_choice_dialog_need_to_buy`);
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal("clerkadvice")
      .executes(ctx => {
        const player = ctx.source.player;

        if (!player) return 0;

        global.showNpcClerkAdvice(ctx.source.server, player);
        return 1;
      })
  );

  event.register(
    Commands.literal("clerkshop")
      .executes(ctx => {
        const player = ctx.source.player;

        if (!player) return 0;

        const server = ctx.source.server;
        //Replace with shop command
        //server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} clerk_unique_purchase`);
        server.runCommandSilent(`openshop ${player.username} mart`);
        return 1;
      })
  );

  event.register(
    Commands.literal("moddcorptravel") // shows the npc's traveling line, then teleports to the destination
      .then(Commands.argument("npc", Arguments.STRING.create(event))
        .then(Commands.argument("location", Arguments.STRING.create(event))
          .executes(ctx => {
            const player = ctx.source.player;

            if (!player) return 0;

            const server = ctx.source.server;
            const npc = Arguments.STRING.getResult(ctx, "npc");
            const location = Arguments.STRING.getResult(ctx, "location");
            global.travelToLocation(server, player, npc, location);
            return 1;
          })
        )
      )
  );

  event.register(
    Commands.literal("moddcorpreject") // shows the npc's rejected line when travel is declined
      .then(Commands.argument("npc", Arguments.STRING.create(event))
        .executes(ctx => {
          const player = ctx.source.player;

          if (!player) return 0;

          const server = ctx.source.server;
          const npc = Arguments.STRING.getResult(ctx, "npc");
          server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} ${npc}_unique_rejected`);
          return 1;
        })
      )
  );
});

// The NPC the player last interacted with; its entity anchors where the opposing Pokémon appear
global.npcBattleTargets = global.npcBattleTargets || {};

// NPC key (dialog.npc.<key>.name) -> league encounter fought through /moddcorpbattle
global.gymTrainerEncounters = {
  gym_bug_trainer: "bug_trainer_01",
  gym_leader_bug_shino: "bug_leader",
  gym_leader_ground_ashley: "ground_leader",
  gym_leader_water_kamiya: "water_leader",
  gym_leader_poison_kinoko: "poison_leader",
  gym_leader_fire_tim: "fire_leader",
  gym_leader_electric_voltaire: "electric_leader",
  gym_leader_ice_glacia: "ice_leader",
  gym_leader_normal_maddie: "normal_leader",
};

// NPCs that have the full set of state dialogs (<npc>_choice_dialog_<state>); the others only have "challenge"
global.gymTrainerFullDialogs = [
  "gym_leader_bug_shino",
  "gym_leader_ground_ashley",
  "gym_leader_water_kamiya",
  "gym_leader_poison_kinoko",
  "gym_leader_fire_tim",
  "gym_leader_electric_voltaire",
  "gym_leader_ice_glacia",
  "gym_leader_normal_maddie",
];

// Number of random variants for states with several lines (dialog ids get a _<n> suffix)
const gymDialogVariants = { is_busy: 2 };

global.npcBattleKeys = global.npcBattleKeys || {};

global.showGymDialog = (server, player, npcId, state) => {
  const variants = gymDialogVariants[state];
  const suffix = variants ? `_${Math.floor(Math.random() * variants)}` : "";
  server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} ${npcId}_choice_dialog_${state}${suffix}`);
};

const hasHealthyPokemon = (player) => {
  let healthy = false;
  const party = global.getPlayerParty(player);
  if (party) party.forEach((pokemon) => { if (pokemon.getCurrentHealth() > 0) healthy = true; });
  return healthy;
};

const isEncounterBusy = (player, encounterId) => {
  var now = Date.now();
  var BattleRegistry = Java.loadClass("com.cobblemon.mod.common.battles.BattleRegistry").INSTANCE;
  var uuids = Object.keys(global.pendingNpcBattles);
  for (var i = 0; i < uuids.length; i++) {
    var uuid = uuids[i];
    var pending = global.pendingNpcBattles[uuid];
    if (pending.encounterId !== encounterId) continue;
    if (!pending.started) {
      if (now - pending.requestedAt < 10000) return true;
      continue;
    }
    // A started battle that never reported a result (fled, disconnected) must not block the NPC forever
    try {
      if (BattleRegistry.getBattleByParticipatingPlayerId(UUID.fromString(uuid)) != null) return true;
    } catch (err) {
      if (now - pending.requestedAt < 20 * 60 * 1000) return true;
    }
  }
  return false;
};

// Returns "ready" or the dialog state explaining why the player can't battle right now
global.getGymEncounterState = (player, encounterId) => {
  var encounter = global.leagueConfig[encounterId];
  if (encounter.completedStage && player.stages.has(encounter.completedStage)) return "completed";
  if (encounter.requiredStages && encounter.requiredStages.some((stage) => !player.stages.has(stage))) return "locked";
  if (isEncounterBusy(player, encounterId)) return "is_busy";
  if (!hasHealthyPokemon(player)) return "missing_pokemon";
  return "ready";
};

global.startNpcBattle = (server, player, encounterId) => {
  var encounter = global.leagueConfig[encounterId];
  if (!encounter) return false;

  var playerKey = String(player.uuid);
  var npcId = global.npcBattleKeys[playerKey];
  var gateState = "ready";
  if (npcId && global.gymTrainerFullDialogs.includes(npcId)) {
    gateState = global.getGymEncounterState(player, encounterId);
    if (gateState !== "ready") {
      global.showGymDialog(server, player, npcId, gateState);
      return false;
    }
  } else {
    var allowed = true;
    global.handleLeagueInteraction(player, server, { encounterId: encounterId }, { cancel: () => { allowed = false; } });
    if (!allowed) return false;
  }

  // Falls back to the player as the anchor entity (the same thing the duo podium does) if the NPC is unknown
  var anchor = global.npcBattleTargets[playerKey] || playerKey;
  global.pendingNpcBattles[playerKey] = { encounterId: encounterId, requestedAt: Date.now(), started: false, trainerId: encounter.trainerId };
  server.runCommandSilent(`trainers makebattle ${player.username} ${encounter.trainerId} ${anchor}`);
  return true;
};

// Called when an NPC battle ends. Dialog keys are written from the NPC's perspective:
// battle_won = the NPC won, battle_lost = the player won.
global.showNpcBattleResult = (server, player, encounterId, playerWon) => {
  const npcId = global.gymTrainerFullDialogs.find((id) => global.gymTrainerEncounters[id] === encounterId);
  if (!npcId) return;
  server.scheduleInTicks(40, () => {
    global.showGymDialog(server, player, npcId, playerWon ? "battle_lost" : "battle_won");
  });
};

global.handleNpcGymTrainer = (e, level, server, target, player, npcId) => {
  const encounterId = global.gymTrainerEncounters[npcId];
  if (!encounterId) return;
  global.npcBattleTargets[String(player.uuid)] = String(target.getUuid());
  global.npcBattleKeys[String(player.uuid)] = npcId;
  var dialogState = "challenge";
  var encounterState = "ready";
  if (global.gymTrainerFullDialogs.includes(npcId)) {
    encounterState = global.getGymEncounterState(player, encounterId);
    if (encounterState !== "ready") dialogState = encounterState;
  }
  global.showGymDialog(server, player, npcId, dialogState);
};

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal("moddcorphome") // /moddcorphome <npcType>: gives a villager home bound to that NPC type, no invitation item needed
      .requires(src => src.hasPermission(2))
      .then(Commands.argument("type", Arguments.STRING.create(event))
        .suggests((ctx, builder) => {
          (global.villagerHomeTypes || []).forEach((t) => builder.suggest(String(t)));
          return builder.buildFuture();
        })
        .executes(ctx => {
          const player = ctx.source.player;
          if (!player) return 0;
          const type = Arguments.STRING.getResult(ctx, "type");
          player.give(Item.of("society:villager_home", `{type:"${type}"}`));
          player.tell(Text.of(`Gave a villager home for "${type}". Place it to move the NPC in.`).green());
          return 1;
        })
      )
  );

  event.register(
    Commands.literal("moddcorpbattle") // dialog button: /moddcorpbattle <encounterId>
      .then(Commands.argument("encounter", Arguments.STRING.create(event))
        .executes(ctx => {
          const player = ctx.source.player;
          if (!player) return 0;
          const encounterId = Arguments.STRING.getResult(ctx, "encounter");
          return global.startNpcBattle(ctx.source.server, player, encounterId) ? 1 : 0;
        })
      )
  );
});

global.showNpcClerkAdvice = (server, player) => {
  const stage = getCurrentStage(player);
  const variation = getRandomInt(0, 4);
  server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} clerk_unique_advice_stage_${stage}_${variation}`);
};

global.handleNpcShipmaster = (e, level, server, target, player) => {
  const location = getClosestLocation(target, ["silkbasin", "jewel", "archi"]);
  const stage = getCurrentStage(player);
  if (stage >= 1) {
    if (location === "silkbasin") {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} shipmaster_choice_dialog_need_to_travel_silk_basin`);
    } else if (location === "jewel") {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} shipmaster_choice_dialog_need_to_travel_jewel_desert`);
    } else if (location === "archi"){
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} shipmaster_choice_dialog_need_to_travel_archi`);
    }
  } else {
    server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} shipmaster_unique_not_ready_to_travel`);
  }
};

global.handleNpcSubway = (e, level, server, target, player) => {
  const location = getClosestLocation(target, ["chesnosubway", "polaris", "shiromori"]);
  const stage = getCurrentStage(player);
  if (location === "chesnosubway") {
    if (stage >= 2 && stage <= 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_chesno_early`);
    } else if (stage > 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_chesno_late`);
    } else {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_unique_out_of_service`);
    }
  } else if (location === "polaris") {
    if (stage >= 2 && stage <= 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_polaris_early`);
    } else if (stage > 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_polaris_late`);
    } else {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_unique_out_of_service`);
    }
  } else if (location === "shiromori") {
    if (stage >= 2 && stage <= 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_shiromori_early`);
    } else if (stage > 4) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_choice_dialog_need_to_travel_shiromori_late`);
    } else {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} subway_unique_out_of_service`);
    }
  }
};

global.handleNpcAviator = (e, level, server, target, player) => {
  const location = getClosestLocation(target, ["chesnoairship", "stratos", "battlemountain"]);
  const stage = getCurrentStage(player);
  if (location === "chesnoairship") {
    if (stage < 6) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_unique_not_ready_to_travel`);
    } else if (stage >=6 && stage <= 9) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_chesno_early`);
    } else {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_chesno_late`);
    }
  } else if (location === "stratos") {
    if (stage < 9) { //Can only go to chesno
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_stratos_early`);
    } else { //Can go to chesno or battle mountain
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_stratos_late`);
    }
  } else if (location === "battlemountain") {
    if (stage < 6) { //Can only go to chesno, unique dialog
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_battle_mountain_very_early`);
    } else if (stage < 9) { //Can only go to chesno or stratos, unique dialog
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_battle_mountain_early`);
    } else { //Can go to chesno or stratos
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_battle_mountain_late`);
    }
  }
};

global.travelToLocation = (server, player, npc, location) => {
  server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} ${npc}_unique_traveling`);
  server.runCommandSilent(`tp ${player.getUuid()} ${locationCoords[location].x} ${locationCoords[location].y} ${locationCoords[location].z}`);
};

function getCurrentStage(player) {
  //Stages
  // 0: No stages
  // 1: gym_bug_complete
  // 2: gym_ground_complete, not gym_water_complete
  // 3: gym_water_complete, not gym_ground_complete
  // 4: gym_water_complete, gym_ground_complete
  // 5: gym_poison_complete
  // 6: gym_fire_complete
  // 7: gym_electric_complete
  // 8: gym_ice_complete
  // 9: gym_normal_complete
  // 10: league_complete
  //Retrieves the player's current stage to determine what dialog to build
  if (player.stages.has("league_complete")) {
    return 10;
  }
  if (player.stages.has("gym_normal_complete")) {
    return 9;
  }
  if (player.stages.has("gym_ice_complete")) {
    return 8;
  }
  if (player.stages.has("gym_electric_complete")) {
    return 7;
  }
  if (player.stages.has("gym_fire_complete")) {
    return 6;
  }
  if (player.stages.has("gym_poison_complete")) {
    return 5;
  }
  if (player.stages.has("gym_water_complete")) {
    if (player.stages.has("gym_ground_complete")) {
      return 4;
    }
    return 3;
  }
  if (player.stages.has("gym_ground_complete")) {
    return 2;
  }
  if (player.stages.has("gym_bug_complete")) {
    return 1;
  }
  return 0;
}

const locationCoords = {
  silkbasin: {x: 748, z: 1734, y: 63},
  jewel: {x: 895, z: 2465, y: 64},
  archi: {x:-514, z: 2695, y: 63},
  polaris: {x: 334, z: 125, y: 63},
  chesnosubway: {x: 764, z: 426, y: 65},
  shiromori: {x: 2395, z: 707, y: 70},
  chesnoairship: {x: 707, z: 413, y: 72},
  stratos: {x: 100, z: 100, y: 100}, //placeholder for sky location
  battlemountain: {x: -100, z: -100, y: 100} //placeholder for battle mountain location
};

function getClosestLocation(entity, candidates) {
  // Compares the NPC entity's own fixed position, not the player's, since multiple
  // entities share the same preset and only their placement tells them apart
  let closestLocation = null;
  let closestDistance = Infinity;
  for (const location of candidates) {
    let coords = locationCoords[location];
    let dx = entity.x - coords.x;
    let dy = entity.y - coords.y;
    let dz = entity.z - coords.z;
    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestLocation = location;
    }
  }
  return closestLocation;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}