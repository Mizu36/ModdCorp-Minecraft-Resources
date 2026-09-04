console.info("[LEAGUE] leagueLogic.js loaded");
console.info("[LEAGUE] Config:");
console.info(global.leagueConfig);


global.runLeaguePodium = function(entity){

    const { level, block } = entity;

    let nbt = block.getEntityData();

    let encounterId = nbt.data.encounterId;

    if(!encounterId)
        return;

    const encounter = global.leagueConfig[encounterId];

    if(!encounter)
        return;

    let spawnTrainer = global.removeNearbyTrainers(level, block);

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