console.info("[MODDCORP] registerModdcorpAdditions.js loaded");


//==============================================
// Logic
//==============================================

// The model's front texture is rotated 180 so it reads upright on walls, so floor and ceiling add 180 to y to compensate
const cardScannerRotations = {
  floor: { x: 0, y: { north: 180, east: 270, south: 0, west: 90 } },
  wall: { x: 90, y: { north: 0, east: 90, south: 180, west: 270 } },
  ceiling: { x: 180, y: { north: 0, east: 90, south: 180, west: 270 } },
};
// The denied look is a separate block the script swaps in for 3 seconds (button blocks don't support custom properties)
function buildCardScannerVariants(idleModel, poweredModel) {
  let variants = {};
  Object.keys(cardScannerRotations).forEach((face) => {
    ["north", "east", "south", "west"].forEach((facing) => {
      [true, false].forEach((powered) => {
        let rot = cardScannerRotations[face];
        let state = { model: "moddcorp:block/" + (powered ? poweredModel : idleModel) };
        if (rot.x) state.x = rot.x;
        if (rot.y[facing]) state.y = rot.y[facing];
        variants[`face=${face},facing=${facing},powered=${powered}`] = state;
      });
    });
  });
  return variants;
}

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



//==============================================
// Custom Item and Block Registration
//==============================================

StartupEvents.registry("sound_event", event => {
    event.create("moddcorp:player_battle");
    event.create("moddcorp:gym_leader_battle");
    event.create("moddcorp:gym_leader_rematch");
    event.create("moddcorp:elite_four_battle");
    event.create("moddcorp:elite_four_rematch");
    event.create("moddcorp:champion_battle");
    event.create("moddcorp:champion_rematch");
    event.create("moddcorp:boss_battle");
    event.create("moddcorp:boss_pokemon_battle");
    event.create("moddcorp:trainer_battle");
    event.create("moddcorp:trainer_battle_alt");
    event.create("moddcorp:trainer_battle_upbeat");
    event.create("moddcorp:expert_battle");
    event.create("moddcorp:wild_battle");
    event.create("moddcorp:wild_battle_alt");
});

// [sound id, display name, length in seconds (rounded up), texture name]
const MUSIC_DISCS = [
    ["player_battle", "Player Battle", 278, "music_disc_player"],
    ["gym_leader_battle", "Gym Leader Battle", 212, "music_disc_gym_leader"],
    ["gym_leader_rematch", "Gym Leader Rematch", 209, "music_disc_gym_leader_rematch"],
    ["elite_four_battle", "Elite Four Battle", 240, "music_disc_elite_four"],
    ["elite_four_rematch", "Elite Four Rematch", 367, "music_disc_elite_four_rematch"],
    ["champion_battle", "Champion Battle", 546, "music_disc_champion"],
    ["champion_rematch", "Champion Rematch", 519, "music_disc_champion_rematch"],
    ["boss_battle", "Boss Battle", 161, "music_disc_boss"],
    ["boss_pokemon_battle", "Boss Pokemon Battle", 194, "music_disc_legendary"],
    ["trainer_battle", "Trainer Battle", 163, "music_disc_trainer"],
    ["trainer_battle_alt", "Trainer Battle (Alt)", 178, "music_disc_trainer_2"],
    ["trainer_battle_upbeat", "Trainer Battle (Upbeat)", 264, "music_disc_trainer_3"],
    ["expert_battle", "Expert Battle", 183, "music_disc_expert"],
    ["wild_battle", "Wild Battle", 227, "music_disc_wild"],
    ["wild_battle_alt", "Wild Battle (Alt)", 73, "music_disc_wild_2"]
];

StartupEvents.registry("item", event => {
    MUSIC_DISCS.forEach(([sound, name, seconds, texture]) => {
        event.create("moddcorp:music_disc_" + sound, "music_disc")
            .displayName(name)
            .song("moddcorp:" + sound, seconds)
            .texture("moddcorp:item/" + texture)
            .tooltip(name + " Music");
    });
});

StartupEvents.registry("item", event => {
  event.create("moddcorp:legendary_whistle")
    .displayName("Legendary Whistle")
    .maxStackSize(1)
    .tooltip("A whistle that calls forth a legendary Cobblemon")
});

StartupEvents.registry("block", event => {
  event.create("sunlit_cobblemon:cobblemon_spawner")
    .displayName("Cobblemon Spawner")
    .soundType("amethyst")
    .hardness(1)
    .resistance(10)
    .noDrops()
    .tagBlock("minecraft:mineable/pickaxe")
    // Vanilla's spawner texture has transparent "cage" gaps, so it must render
    // like glass or neighboring blocks get their faces culled through it.
    .defaultCutout()
    .model("minecraft:block/spawner")
    .item(item => {
      item.modelJson({ parent: "minecraft:block/spawner" });
    })
    .blockEntity(blockInfo => {
      blockInfo.enableSync();
      blockInfo.initialData({
        SpawnerID: "",
        Cobblemon: "bulbasaur",
        Hisuian: false,
        RegionBias: null,
        MedianLevel: 1,
        LevelVariance: 3,
        SpawnRadius: 4,
        MaxNearby: 5,
        RespawnDelay: 300,
        LastSpawn: 0,
        Owned: []
      });
      // Each spawner block entity ticks and processes itself.
      blockInfo.serverTick(20, 0, entity => {
        global.tickCobblemonSpawner(entity);
      });
    });
});

StartupEvents.registry("block", (event) => {
  let builder = event
    .create("moddcorp:card_scanner", "button")
    .displayName("Card Scanner")
    .ticksToStayPressed(200)
    .textureAll("moddcorp:block/card_scanner")
    .hardness(-1)
    .resistance(3600000)
    .model("moddcorp:block/card_scanner")
    .item((item) => {
      item.modelJson({ parent: "moddcorp:block/card_scanner" });
    });
  builder.blockstateJson = { variants: buildCardScannerVariants("card_scanner", "card_scanner") };

  // The client predicts a button press on right click, so the idle block looks idle even when pressed;
  // the script swaps to this block (approved look) only for a real swipe
  let approved = event
    .create("moddcorp:card_scanner_approved", "button")
    .displayName("Card Scanner (Approved)")
    .ticksToStayPressed(200)
    .textureAll("moddcorp:block/card_scanner_approved")
    .hardness(-1)
    .resistance(3600000)
    .noItem()
    .model("moddcorp:block/card_scanner_approved");
  approved.blockstateJson = { variants: buildCardScannerVariants("card_scanner_approved", "card_scanner_approved") };

  let denied = event
    .create("moddcorp:card_scanner_denied", "button")
    .displayName("Card Scanner (Denied)")
    .ticksToStayPressed(200)
    .textureAll("moddcorp:block/card_scanner_denied")
    .hardness(-1)
    .resistance(3600000)
    .noItem()
    .model("moddcorp:block/card_scanner_denied");
  denied.blockstateJson = { variants: buildCardScannerVariants("card_scanner_denied", "card_scanner_denied") };
});

