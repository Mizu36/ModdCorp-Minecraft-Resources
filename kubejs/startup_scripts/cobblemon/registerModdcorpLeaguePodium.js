console.info("[MODDCORP] registerModdcorpLeaguePodium.js loaded");

function resetNearbyTrainers (level, block, forceRemoval) {
  let noTrainers = false;
  let nearbyTrainers = level
    .getEntitiesWithin(AABB.ofBlock(block).inflate(4))
    .filter((entityType) => entityType.type === "rctmod:trainer");
  if (nearbyTrainers.length == 0) {
    noTrainers = true;
  } else {
    let foundTrainer = nearbyTrainers[0];
    let foundTrainerNBT = foundTrainer.getNbt();
    let isBugged = false;
    if (foundTrainerNBT.TrainerId == undefined || foundTrainerNBT.TrainerId == "" || foundTrainerNBT.TrainerId == "dev.latvian.mods.rhino.Undefined@0") {
      isBugged = true;
    }
    if (
      forceRemoval || isBugged ||
      foundTrainerNBT.Defeats > 0 ||
      foundTrainerNBT.Wins > 0
    ) {
      noTrainers = true;
      foundTrainer.setRemoved("unloaded_to_chunk");
      level.spawnParticles(
        "species:ascending_dust",
        true,
        foundTrainer.x,
        foundTrainer.y + 0.5,
        foundTrainer.z,
        0.1 * rnd(1, 4),
        0.1 * rnd(1, 4),
        0.1 * rnd(1, 4),
        10,
        0.1
      );
    }
  }
  return noTrainers;
};

global.getTrainerSpawnPos = function(level, block) {

    let startY = block.y;

    for (let y = startY + 1; y <= 320; y++) {

        let checkBlock = level.getBlock(new BlockPos(block.x, y, block.z));

        if (checkBlock.id == "minecraft:air") {
          let spawnY;

          if (y == block.y + 1) {
              // Visible podium
              spawnY = Number(block.y);
          } else {
              // Hidden by one or more blocks
              spawnY = Number(y);
            }

            return [
                Number(block.x) + 0.5,
                spawnY,
                Number(block.z) + 0.5
            ];

        }

    }

    // Should never happen, but prevents crashes.
    return [
        Number(block.x) + 0.5,
        Number(startY),
        Number(block.z) + 0.5
    ];

};

global.runLeaguePodium = function(entity){

    const { level, block } = entity;

    let nbt = block.getEntityData();

    let encounterId = nbt.data.encounterId;

    if(!encounterId)
        return;

    const encounter = global.leagueConfig[encounterId];

    if(!encounter)
        return;

    let spawnTrainer = resetNearbyTrainers(level, block);

    if(!spawnTrainer)
        return;

    let freshTrainer = level.createEntity("rctmod:trainer");

    let trainerNBT = freshTrainer.getNbt();

    trainerNBT.TrainerId = encounter.trainerId;

    trainerNBT.NoAI = true;

    trainerNBT.Pos = global.getTrainerSpawnPos(level, block);

    trainerNBT.Rotation = [
        NBT.f(global.rotationFromFacing(block.properties.get("facing"))),
        NBT.f(0)
    ];

    freshTrainer.setNbt(trainerNBT);

    freshTrainer.persistentData.levelTier = 1;
    freshTrainer.persistentData.gymLeader = "league";
    freshTrainer.persistentData.encounterId = encounterId;
    freshTrainer.persistentData.podiumX = block.x;
    freshTrainer.persistentData.podiumY = block.y;
    freshTrainer.persistentData.podiumZ = block.z;

    freshTrainer.spawn();

    console.info("Spawned TrainerId: " + freshTrainer.getNbt().TrainerId);

    level.spawnParticles(
        "species:ascending_dust",
        true,
        freshTrainer.x,
        freshTrainer.y + 0.5,
        freshTrainer.z,
        0.1 * rnd(1,4),
        0.1 * rnd(1,4),
        0.1 * rnd(1,4),
        10,
        0.1
    );

};

StartupEvents.registry("block", (event) => {
  event
    .create("moddcorp:league_podium", "cardinal")
    .tagBlock("minecraft:mineable/pickaxe")
    .tagBlock("minecraft:mineable/axe")
    .tagBlock("minecraft:needs_stone_tool")
    .waterlogged()
    .box(1, 0, 1, 15, 2, 15)
    .defaultCutout()
    .item((item) => {
      item.tooltip(Text.translatable("block.sunlit_cobblemon.trainer_podium.description").gray());
      item.modelJson({
        parent: "sunlit_cobblemon:block/kubejs/trainer_podium",
      });
    })
    .model("sunlit_cobblemon:block/kubejs/trainer_podium")
    .blockEntity((blockInfo) => {
      blockInfo.enableSync();
      blockInfo.initialData({encounterId: ""});
      blockInfo.serverTick(200, 0, (entity) => {
        global.runLeaguePodium(entity);
      });
    })
});
