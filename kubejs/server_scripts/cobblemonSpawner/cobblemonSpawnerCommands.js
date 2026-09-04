ServerEvents.commandRegistry(event => {

    const { commands: Commands, arguments: Arguments } = event;

    event.register(

        Commands.literal("cobblespawner")

        .then(
            Commands.literal("create")
                .then(
                    Commands.argument(
                        "cobblemon",
                        Arguments.STRING.create(event)
                    )
                    .executes(ctx => createSpawnerCommand(ctx))
                )
        )

        .then(
            Commands.literal("set")
                .then(
                    Commands.argument(
                        "property",
                        Arguments.STRING.create(event)
                    )
                    .then(
                        Commands.argument(
                            "value",
                            Arguments.STRING.create(event)
                        )
                        .executes(ctx => setSpawnerPropertyCommand(ctx))
                    )
                )
        )

        .then(
            Commands.literal("info")
                .executes(ctx => infoSpawnerCommand(ctx))
        )

        .then(
            Commands.literal("give")
                .executes(ctx => giveSpawnerCommand(ctx, "bulbasaur"))
                .then(
                    Commands.argument(
                        "cobblemon",
                        Arguments.STRING.create(event)
                    )
                    .executes(ctx => giveSpawnerCommand(
                        ctx,
                        ctx.getArgument("cobblemon", Java.loadClass("java.lang.String"))
                    ))
                )
        )

        .then(
            Commands.literal("wand")
                .executes(ctx => {

                    giveCobbleWand(ctx.source.player);

                    return 1;

                })
        )

    );

});

// Baking the data into BlockEntityTag lets vanilla transfer it to the block
// entity the instant it's placed, instead of racing our own placed handler.
function createSpawnerItem(cobblemon) {

    let id = UUID.randomUUID().toString();

    return Item.of(COBBLEMON_SPAWNER_ID,
        `{BlockEntityTag:{data:{` +
        `SpawnerID:"${id}",` +
        `Cobblemon:"${cobblemon}",` +
        `Hisuian:0b,` +
        `MedianLevel:1,` +
        `LevelVariance:3,` +
        `SpawnRadius:4,` +
        `MaxNearby:5,` +
        `RespawnDelay:300,` +
        `LastSpawn:0,` +
        `Owned:[]` +
        `}}}`);
}

function giveSpawnerCommand(ctx, cobblemon) {

    let player = ctx.source.player;

    if (!player)
        return 0;

    player.give(createSpawnerItem(cobblemon));

    return 1;
}

function createSpawnerCommand(ctx) {
    
    let cobblemon = ctx.getArgument("cobblemon", Java.loadClass("java.lang.String"));

    let player = ctx.source.player;

    let hit = player.pick(10, 0, false);

    if (!hit) {
        return 0;
    }

    let block = player.level.getBlock(hit.blockPos);
    
    if (block.id != COBBLEMON_SPAWNER_ID) {
        player.tell("Look at a Cobblemon spawner block.");
        return 0;
    }

    global.initializeCobblemonSpawner(block, cobblemon);
    return 1;
}

function setSpawnerPropertyCommand(ctx) {

    let player = ctx.source.player;

    if (!player)
        return 0;

    let hit = player.pick(10, 0, false);

    if (!hit)
        return 0;

    let block = player.level.getBlock(hit.blockPos);

    if (block.id != COBBLEMON_SPAWNER_ID) {

        player.tell("Look at a Cobblemon spawner.");

        return 0;
    }

    let spawner = getSpawnerData(block);

    if (!spawner) {

        player.tell("That isn't a Cobblemon spawner.");

        return 0;
    }

    let property = ctx.getArgument(
        "property",
        Java.loadClass("java.lang.String")
    );

    let value = ctx.getArgument(
        "value",
        Java.loadClass("java.lang.String")
    );

    spawner[property] = coerceSpawnerPropertyValue(property, value);
    saveSpawner(block, spawner);

    return 1;
}

// Command arguments always arrive as strings, but the NBT reader expects real
// numeric/boolean types for these fields, or downstream logic (e.g. randomLevel)
// silently breaks on the string form.
const NUMERIC_SPAWNER_PROPERTIES = [
    "MedianLevel",
    "LevelVariance",
    "SpawnRadius",
    "MaxNearby",
    "RespawnDelay",
    "LastSpawn"
];

function coerceSpawnerPropertyValue(property, value) {

    if (NUMERIC_SPAWNER_PROPERTIES.includes(property)) {

        let num = Number(value);

        return isNaN(num) ? value : num;
    }

    if (property == "Hisuian")
        return value == "true" || value == "1";

    return value;
}

function infoSpawnerCommand(ctx) {

    let player = ctx.source.player;

    if (!player)
        return 0;

    let hit = player.pick(10, 0, false);

    if (!hit)
        return 0;

    let block = player.level.getBlock(hit.blockPos);

    if (block.id != COBBLEMON_SPAWNER_ID) {

        player.tell("Look at a Cobblemon spawner.");

        return 0;
    }

    let spawner = getSpawnerData(block);

    if (!spawner) {

        player.tell("That isn't a Cobblemon spawner.");

        return 0;
    }

    player.tell("§6=== Cobblemon Spawner ===");
    player.tell("§eCobblemon: §f" + spawner.Cobblemon);
    player.tell("§eHisuian: §f" + spawner.Hisuian);
    player.tell("§eRegion Bias: §f" + spawner.RegionBias);
    player.tell("§eMedian Level: §f" + spawner.MedianLevel);
    player.tell("§eVariance: §f±" + spawner.LevelVariance);
    player.tell("§eSpawn Radius: §f" + spawner.SpawnRadius);
    player.tell("§eRespawn Delay: §f" + spawner.RespawnDelay);
    player.tell("§eMax Nearby: §f" + spawner.MaxNearby);
    player.tell("§eOwned: §f" + spawner.Owned.length);
    player.tell("§eSpawner ID:");
    player.tell("§7" + spawner.SpawnerID);

    return 1;
}

