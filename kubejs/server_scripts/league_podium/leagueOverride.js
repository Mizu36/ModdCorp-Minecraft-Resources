console.info("[LEAGUE] leagueOverride.js loaded");

BlockEvents.placed("sunlit_cobblemon:trainer_podium", event => {

    const { block, player } = event;

    // Find the item that was just placed
    let item = player.getHeldItem("main_hand");

    if (item.id !== "sunlit_cobblemon:trainer_podium") {
        item = player.getHeldItem("off_hand");
    }

    if (item.id !== "sunlit_cobblemon:trainer_podium")
        return;

    let itemNBT = item.getNbt();

    if (!itemNBT || itemNBT.isEmpty())
        return;

    // Not one of our podiums
    if (!itemNBT.contains("LeagueMode"))
        return;

    console.info("[LEAGUE] League podium detected!");

    let blockNBT = block.getEntityData();

    blockNBT.merge({

        data: {

            LeagueMode: true,

            encounterId: itemNBT.getString("encounterId")

        }

    });

    global.setBlockEntityData(block, blockNBT);

    console.info("[LEAGUE] encounterId = " + itemNBT.getString("encounterId"));

});

console.info("[LEAGUE] Original function:");
console.info(global.runTrainerPodium);

const originalRunTrainerPodium = global.runTrainerPodium;

global.runTrainerPodium = function(entity) {

    const nbt = entity.block.getEntityData();

    if (nbt.data?.LeagueMode) {

        global.runLeaguePodium(entity);

        return;
    }

    originalRunTrainerPodium(entity);

}