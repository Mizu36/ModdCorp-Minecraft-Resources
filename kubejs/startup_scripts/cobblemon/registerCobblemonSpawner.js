console.info("[CobblemonSpawner] registerCobblemonSpawner.js loaded");

// Custom block that reuses the vanilla spawner's model/texture but stores
// its own Cobblemon spawner data directly on its block entity.
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
