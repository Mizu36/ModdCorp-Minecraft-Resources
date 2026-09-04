const WAND_NAME = "§bCobble Wand";
global.cobblemonClipboard = {};

BlockEvents.rightClicked(event => {

    if (!isCobbleWand(event.item))
        return;

    if (event.block.id != COBBLEMON_SPAWNER_ID)
        return;

    if (event.player.shiftKeyDown) {

        copySpawner(event.player, event.block);

    }
    else {

        pasteSpawner(event.player, event.block);

    }

    event.cancel();

});

BlockEvents.leftClicked(event => {

    if (!isCobbleWand(event.item))
        return;

    if (event.block.id != COBBLEMON_SPAWNER_ID)
        return;

    if (event.player.shiftKeyDown) {

        delete global.cobblemonClipboard[event.player.uuid];

        event.player.tell("Clipboard cleared.");

    }
    else {

        infoSpawner(event.player, event.block);

    }

    event.cancel();

});

function isCobbleWand(item) {

    if (item.empty)
        return false;

    if (item.id != "minecraft:blaze_rod")
        return false;

    return item.hoverName.string == WAND_NAME;
}

function giveCobbleWand(player) {

    let stack = Item.of("minecraft:blaze_rod");

    stack.setHoverName(Text.of(WAND_NAME));

    player.give(stack);
}

function copySpawner(player, block) {

    let spawner = getSpawnerData(block);

    if (!spawner)
        return false;

    global.cobblemonClipboard[player.uuid] = {

        Cobblemon: spawner.Cobblemon,

        Hisuian: spawner.Hisuian,

        RegionBias: spawner.RegionBias,

        MedianLevel: spawner.MedianLevel,

        LevelVariance: spawner.LevelVariance,

        SpawnRadius: spawner.SpawnRadius,

        RespawnDelay: spawner.RespawnDelay,

        MaxNearby: spawner.MaxNearby

    };

    player.tell("§aSpawner copied.");

    return true;

}

function pasteSpawner(player, block) {

    let clipboard = global.cobblemonClipboard[player.uuid];

    if (!clipboard) {

        player.tell("§cClipboard empty.");

        return false;
    }

    global.initializeCobblemonSpawner(block);

    let runtime = getSpawnerData(block);

    for (let key in clipboard)
        runtime[key] = clipboard[key];

    saveSpawner(block, runtime);

    player.tell("§aSpawner pasted.");

    return true;

}