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
  const location = getClosestLocation(target, ["chesnoairship", "sky", "battlemountain"]);
  const stage = getCurrentStage(player);
  if (location === "chesnoairship") {
    if (stage < 6) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_unique_not_ready_to_travel`);
    } else if (stage >=6 && stage <= 9) {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_chesno_early`);
    } else {
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_chesno_late`);
    }
  } else if (location === "sky") {
    if (stage < 9) { //Can only go to chesno
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_sky_early`);
    } else { //Can go to chesno or battle mountain
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_sky_late`);
    }
  } else if (location === "battlemountain") {
    if (stage < 6) { //Can only go to chesno, unique dialog
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_battle_mountain_very_early`);
    } else if (stage < 9) { //Can only go to chesno or sky, unique dialog
      server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} aviator_choice_dialog_need_to_travel_battle_mountain_early`);
    } else { //Can go to chesno or sky
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
  chesnoairship: {x: 800, z: 400, y: 70}, //placeholder for chesno airship location
  sky: {x: 100, z: 100, y: 100}, //placeholder for sky location
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