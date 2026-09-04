const Float = Java.loadClass("java.lang.Float");
const UUID = Java.loadClass("java.util.UUID");
const BlockPos = Java.loadClass("net.minecraft.core.BlockPos");
const PokemonProperties = Java.loadClass("com.cobblemon.mod.common.api.pokemon.PokemonProperties");
const COBBLEMON_SPAWNER_ID = "sunlit_cobblemon:cobblemon_spawner";
const SPAWNER_ACTIVE_RANGE = 32;

// Called from the block's own serverTick - each spawner drives itself instead
// of being scanned from a single global tick loop.
global.tickCobblemonSpawner = function(entity) {

    let block = entity.block;

    let spawner = getSpawnerData(block);

    if (!spawner)
        return;

    if (!playerWithinRange(block.level, block.x, block.y, block.z, SPAWNER_ACTIVE_RANGE))
        return;

    cleanupOwnedPokemon(block, spawner);

    // Use the level's persisted game time, not the server's uptime counter,
    // since the latter resets to 0 every restart and would desync LastSpawn.
    let ticks = block.level.levelData.gameTime;

    // Still waiting on respawn timer.
    if (ticks - spawner.LastSpawn < spawner.RespawnDelay) {
        saveSpawner(block, spawner);
        return;
    }

    if (spawner.Owned.length >= spawner.MaxNearby) {
        saveSpawner(block, spawner);
        return;
    }

    spawnCobblemon(block, spawner);
}

function playerWithinRange(level, x, y, z, range) {

    for (let player of level.server.players) {

        if (String(player.level.dimension) != String(level.dimension))
            continue;

        let dx = player.x - x;
        let dy = player.y - y;
        let dz = player.z - z;

        if (dx * dx + dy * dy + dz * dz <= range * range)
            return true;
    }

    return false;
}

BlockEvents.placed(COBBLEMON_SPAWNER_ID, event => {

    // Items from /cobblespawner give carry their data in BlockEntityTag, which
    // vanilla already copies onto the block entity before this event fires.
    // Only fall back to a fresh default if that didn't happen (e.g. creative menu).
    if (getSpawnerData(event.block))
        return;

    global.initializeCobblemonSpawner(event.block);

});

BlockEvents.rightClicked(event => {

    if (event.hand != "MAIN_HAND")
        return;

    if (event.block.id != COBBLEMON_SPAWNER_ID)
        return;

    let spawner = getSpawnerData(event.block);

    // First click initializes it.
    if (!spawner) {
        global.initializeCobblemonSpawner(event.block);
        console.info("[CobblemonSpawner] Initialized.");
        return;
    }
});

function getSpawnerData(block) {

    let data = block.entityData?.data;

    if (!data || !data.SpawnerID)
        return null;

    return {
        SpawnerID: data.SpawnerID,
        Cobblemon: data.Cobblemon,
        Hisuian: data.Hisuian,
        RegionBias: data.RegionBias,
        MedianLevel: data.MedianLevel,
        LevelVariance: data.LevelVariance,
        SpawnRadius: data.SpawnRadius,
        MaxNearby: data.MaxNearby,
        RespawnDelay: data.RespawnDelay,
        LastSpawn: data.LastSpawn,
        Owned: readUuidList(data.Owned)
    };
}

// NBT string list entries come back as SNBT-quoted values (e.g. "\"uuid\""),
// so they need unwrapping before UUID.fromString() will accept them.
function readUuidList(list) {

    let result = [];

    if (!list)
        return result;

    for (let entry of list) {

        let str = String(entry);

        if (str.length > 1 && str.charAt(0) == "\"" && str.charAt(str.length - 1) == "\"")
            str = str.substring(1, str.length - 1);

        result.push(str);
    }

    return result;
}

function saveSpawner(block, spawner) {

    let nbt = block.getEntityData();

    nbt.merge({
        data: {
            SpawnerID: spawner.SpawnerID,
            Cobblemon: spawner.Cobblemon,
            Hisuian: spawner.Hisuian,
            RegionBias: spawner.RegionBias,
            MedianLevel: spawner.MedianLevel,
            LevelVariance: spawner.LevelVariance,
            SpawnRadius: spawner.SpawnRadius,
            MaxNearby: spawner.MaxNearby,
            RespawnDelay: spawner.RespawnDelay,
            LastSpawn: spawner.LastSpawn,
            Owned: spawner.Owned
        }
    });

    global.setBlockEntityData(block, nbt);
}

function spawnCobblemon(block, spawner) {

    let level = randomLevel(spawner.MedianLevel, spawner.LevelVariance);

    let modifiers = " level=" + level;

    if (spawner.Hisuian)
        modifiers += " hisuian";
    else if (spawner.RegionBias)
        modifiers += " region_bias=" + spawner.RegionBias;

    let props = PokemonProperties.Companion.parse(spawner.Cobblemon + modifiers);

    let entity = props.createEntity(block.level);

    try {
        entity.persistentData.putString(
            "CobblemonSpawnerID",
            spawner.SpawnerID
        );

    } catch (e) {
        console.info("persistentData failed:");
        console.info(e);
    }

    let pos = getRandomSpawnPosition(block.level, block, spawner.SpawnRadius);
    if (!pos) {
        saveSpawner(block, spawner);
        return false;
    }

    entity.setPos(pos.x, pos.y, pos.z);

    let success = block.level.addFreshEntity(entity);

    if (success) {
        spawner.LastSpawn = block.level.levelData.gameTime;
        spawner.Owned.push(entity.getUuid().toString());
    }

    saveSpawner(block, spawner);

    return success;
}

function randomLevel(median, variance) {

    if (median <= 1)
        return 1;

    let min = Math.max(1, median - variance);
    let max = Math.min(100, median + variance);

    return min + Math.floor(Math.random() * (max - min + 1));
}

function getRandomSpawnPosition(level, block, radius) {

    for (let attempt = 0; attempt < 20; attempt++) {

        let dx;
        let dz;

        do {

            dx = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            dz = Math.floor(Math.random() * (radius * 2 + 1)) - radius;

        } while (dx * dx + dz * dz > radius * radius);

        let x = block.x + dx;
        let z = block.z + dz;

        // Start above the spawner
        let startY = block.y + 8;

        for (let y = startY; y >= -64; y--) {

            let feet = level.getBlock(new BlockPos(x, y, z));
            let head = level.getBlock(new BlockPos(x, y + 1, z));
            let aboveHead = level.getBlock(new BlockPos(x, y + 2, z));
            let ground = level.getBlock(new BlockPos(x, y - 1, z));

            let feetAir = feet.id == "minecraft:air";
            let headAir = head.id == "minecraft:air";
            let aboveHeadAir = aboveHead.id == "minecraft:air";

            let feetWater = feet.id == "minecraft:water";
            let headWater = head.id == "minecraft:water";
            let aboveHeadWater = aboveHead.id == "minecraft:water";

            // Normal land spawn:
            // Three blocks of air with a solid block underneath.
            if (feetAir && headAir && aboveHeadAir) {

                if (ground.id != "minecraft:air")
                    return {
                        x: x + 0.5,
                        y: y,
                        z: z + 0.5
                    };
            }

            // Water spawn:
            // Three blocks of water.
            if (feetWater && headWater && aboveHeadWater) {

                return {
                    x: x + 0.5,
                    y: y,
                    z: z + 0.5
                };
            }
        }
    }

    return null;
}

// A Pokémon counts as owned as long as its entity is still alive in the world.
function cleanupOwnedPokemon(block, spawner) {

    let alive = [];

    for (let uuidStr of spawner.Owned) {

        let entity = block.level.getEntity(UUID.fromString(uuidStr));

        if (entity && entity.isAlive())
            alive.push(uuidStr);
    }

    spawner.Owned = alive;
}

global.initializeCobblemonSpawner = function(block, cobblemon) {

    let id = UUID.randomUUID().toString();

    saveSpawner(block, {
        SpawnerID: id,
        Cobblemon: cobblemon ?? "bulbasaur",
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

}