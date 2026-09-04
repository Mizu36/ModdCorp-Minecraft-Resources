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
  const { commands: Commands } = event;

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
});

global.showNpcClerkAdvice = (server, player) => {
  const stage = getCurrentStage(player);
  const variation = getRandomInt(0, 4);
  server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} clerk_unique_advice_stage_${stage}_${variation}`);
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}