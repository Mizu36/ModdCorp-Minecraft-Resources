console.info("[MODDCORP] registerModdcorpAdditions.js loaded");


//==============================================
// League Podium Logic
//==============================================

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

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:rby_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_rby_trainer_battle', 'music_disc')
        .displayName('Red/Blue/Yellow Trainer Battle')
        .song('moddcorp:rby_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_rby')
        .tooltip('Generation 1 (Red/Blue/Yellow)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:sgc_johto_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_sgc_johto_trainer_battle', 'music_disc')
        .displayName('Silver/Gold/Crystal Johto Trainer Battle')
        .song('moddcorp:sgc_johto_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_sgc_johto')
        .tooltip('Generation 2 (Silver/Gold/Crystal)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:sgc_kanto_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_sgc_kanto_trainer_battle', 'music_disc')
        .displayName('Silver/Gold/Crystal Kanto Trainer Battle')
        .song('moddcorp:sgc_kanto_trainer_battle', 109)
        .texture('moddcorp:item/music_disc_sgc_kanto')
        .tooltip('Generation 2 (Silver/Gold/Crystal)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:rse_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_rse_trainer_battle', 'music_disc')
        .displayName('Ruby/Sapphire/Emerald Trainer Battle')
        .song('moddcorp:rse_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_rse')
        .tooltip('Generation 3 (Ruby/Sapphire/Emerald)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:frlg_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_frlg_trainer_battle', 'music_disc')
        .displayName('FireRed/LeafGreen Trainer Battle')
        .song('moddcorp:frlg_trainer_battle', 192)
        .texture('moddcorp:item/music_disc_frlg')
        .tooltip('Generation 3 (FireRed/LeafGreen)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:colosseum_trainer_battle_01')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_colosseum_normal_trainer_battle', 'music_disc')
        .displayName('Colosseum Normal Trainer Battle')
        .song('moddcorp:colosseum_trainer_battle_01', 136)
        .texture('moddcorp:item/music_disc_colosseum_1')
        .tooltip('Generation 3 (Colosseum)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:colosseum_trainer_battle_02')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_colosseum_friendly_trainer_battle', 'music_disc')
        .displayName('Colosseum Friendly Trainer Battle')
        .song('moddcorp:colosseum_trainer_battle_02', 141)
        .texture('moddcorp:item/music_disc_colosseum_2')
        .tooltip('Generation 3 (Colosseum)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:xd_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_xd_trainer_battle', 'music_disc')
        .displayName('XD Trainer Battle')
        .song('moddcorp:xd_trainer_battle', 77)
        .texture('moddcorp:item/music_disc_xd')
        .tooltip('Generation 3 (XD: Gale of Darkness)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:dpp_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_dpp_trainer_battle', 'music_disc')
        .displayName('Diamond/Pearl/Platinum Trainer Battle')
        .song('moddcorp:dpp_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_dpp')
        .tooltip('Generation 4 (Diamond/Pearl/Platinum)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:hgss_johto_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_hgss_johto_trainer_battle', 'music_disc')
        .displayName('HeartGold/SoulSilver Johto Trainer Battle')
        .song('moddcorp:hgss_johto_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_hgss_johto')
        .tooltip('Generation 4 (HeartGold/SoulSilver)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:hgss_kanto_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_hgss_kanto_trainer_battle', 'music_disc')
        .displayName('HeartGold/SoulSilver Kanto Trainer Battle')
        .song('moddcorp:hgss_kanto_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_hgss_kanto')
        .tooltip('Generation 4 (HeartGold/SoulSilver)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:bw_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_bw_trainer_battle', 'music_disc')
        .displayName('Black/White Trainer Battle')
        .song('moddcorp:bw_trainer_battle', 179)
        .texture('moddcorp:item/music_disc_bw')
        .tooltip('Generation 5 (Black/White)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:xy_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_xy_trainer_battle', 'music_disc')
        .displayName('X/Y Trainer Battle')
        .song('moddcorp:xy_trainer_battle', 300)
        .texture('moddcorp:item/music_disc_xy')
        .tooltip('Generation 6 (X/Y)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:oras_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_oras_trainer_battle', 'music_disc')
        .displayName('Omega Ruby/Alpha Sapphire Trainer Battle')
        .song('moddcorp:oras_trainer_battle', 300)
        .texture('moddcorp:item/music_disc_oras')
        .tooltip('Generation 6 (Omega Ruby/Alpha Sapphire)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:sm_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_sm_trainer_battle', 'music_disc')
        .displayName('Sun/Moon Trainer Battle')
        .song('moddcorp:sm_trainer_battle', 300)
        .texture('moddcorp:item/music_disc_sm')
        .tooltip('Generation 7 (Sun/Moon)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:swsh_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_swsh_trainer_battle', 'music_disc')
        .displayName('Sword/Shield Trainer Battle')
        .song('moddcorp:swsh_trainer_battle', 299)
        .texture('moddcorp:item/music_disc_swsh')
        .tooltip('Generation 8 (Sword/Shield)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:sv_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_sv_trainer_battle', 'music_disc')
        .displayName('Scarlet/Violet Trainer Battle')
        .song('moddcorp:sv_trainer_battle', 299)
        .texture('moddcorp:item/music_disc_sv')
        .tooltip('Generation 9 (Scarlet/Violet)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:champions_trainer_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_champions_trainer_battle', 'music_disc')
        .displayName('Champions Trainer Battle')
        .song('moddcorp:champions_trainer_battle', 277)
        .texture('moddcorp:item/music_disc_champions')
        .tooltip('Generation 9 (Champions)')
})

StartupEvents.registry('sound_event', event => {
    event.create('moddcorp:ado_battle')
})

StartupEvents.registry('item', event => {
    event.create('moddcorp:music_disc_ado_battle', 'music_disc')
        .displayName('Ado Trainer Battle')
        .song('moddcorp:ado_battle', 380)
        .texture('moddcorp:item/music_disc_ado')
        .tooltip('Buriki no Dance')
})

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

