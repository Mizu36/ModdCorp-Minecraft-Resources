console.info("[MODDCORP] leagueOverride.js loaded");

BlockEvents.placed("moddcorp:league_podium", event => {
    const { block, player } = event;

    // Find the item that was just placed
    let item = player.getHeldItem("main_hand");

    if (item.id !== "moddcorp:league_podium") {
        item = player.getHeldItem("off_hand");
    }

    if (item.id !== "moddcorp:league_podium")
        return;

    let itemNBT = item.getNbt();

    if (!itemNBT || itemNBT.isEmpty())
        return;

    let blockNBT = block.getEntityData();

    blockNBT.merge({

        data: {
            encounterId: itemNBT.getString("encounterId")
        }

    });

    global.setBlockEntityData(block, blockNBT);

    console.info("[LEAGUE] encounterId = " + itemNBT.getString("encounterId"));
});

global.handleLeagueInteraction = function(player, server, blockData, e){
    let encounter = global.leagueConfig[blockData.encounterId];
    if (!encounter) {
        e.cancel();
        return;
    }
    if (encounter.gymCompletedMessage && encounter.gymCompletedStage && player.stages.has(encounter.gymCompletedStage)) {
        server.runCommandSilent(global.getEmbersTextAPICommand(player.username, global.animalMessageSettings, 80, Text.of(encounter.gymCompletedMessage).toJson()));
        e.cancel();
        return;
    }
    if (encounter.completedStage && player.stages.has(encounter.completedStage)) {
        server.runCommandSilent(global.getEmbersTextAPICommand(player.username, global.animalMessageSettings, 80, Text.of(encounter.completedMessage).toJson()));
        e.cancel();
        return;
    }
    if (encounter.blockedStages) {
        for (let i = 0; i < encounter.blockedStages.length; i++) {
            let stage = encounter.blockedStages[i];
            if (player.stages.has(stage)) {
                server.runCommandSilent(global.getEmbersTextAPICommand(player.username, global.animalMessageSettings, 80, Text.of(encounter.blockedMessage).toJson()));
                e.cancel();
                return;
            }
        }
    }
    if (encounter.requiredStages) {
        for (let i = 0; i < encounter.requiredStages.length; i++) {
            let stage = encounter.requiredStages[i];
            if (!player.stages.has(stage)) {
                server.runCommandSilent(global.getEmbersTextAPICommand(player.username, global.animalMessageSettings, 80, Text.of(encounter.lockedMessage).toJson()));
                e.cancel();
                return;
            }
        }
    }
}