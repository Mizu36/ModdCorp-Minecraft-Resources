console.info("[MODDCORP] playerLevelCapRecovery.js loaded");

const LevelCapRecoveryUUID = Java.loadClass("java.util.UUID");
const LevelCapRecoveryRegistry = Java.loadClass("com.cobblemon.mod.common.battles.BattleRegistry").INSTANCE;
const LevelCapRecoveryComponent = Java.loadClass("net.minecraft.network.chat.Component");

global.queuePlayerLevelCapRecovery = (server, player) => {
    var uuid = String(player.getUuid());
    if (!global.activePlayerLevelCaps[uuid]) return;
    server.scheduleInTicks(20, () => {
        var online = server.getPlayerList().getPlayer(LevelCapRecoveryUUID.fromString(uuid));
        if (online && global.activePlayerLevelCaps[uuid] &&
            !LevelCapRecoveryRegistry.getBattleByParticipatingPlayerId(online.getUuid())) {
            global.restorePlayerLevelCap(online);
        }
    });
};

PlayerEvents.loggedOut(event => {
    var player = event.player;
    if (global.activePlayerLevelCaps[String(player.getUuid())] &&
        !LevelCapRecoveryRegistry.getBattleByParticipatingPlayerId(player.getUuid())) {
        global.restorePlayerLevelCap(player, false);
    }
});

var levelCapRecoveryTicks = 0;
ServerEvents.tick(event => {
    if (++levelCapRecoveryTicks % 100 !== 0) return;
    var activeCaps = global.activePlayerLevelCaps;
    var uuids = Object.keys(activeCaps);
    for (var i = 0; i < uuids.length; i++) {
        var uuid = uuids[i];
        var active = activeCaps[uuid];
        if (Date.now() - active.startedAt < 5000 || (active.retryAt && Date.now() < active.retryAt)) continue;
        var player = event.server.getPlayerList().getPlayer(LevelCapRecoveryUUID.fromString(uuid));
        if (!player || LevelCapRecoveryRegistry.getBattleByParticipatingPlayerId(player.getUuid())) continue;
        if (!global.restorePlayerLevelCap(player)) active.retryAt = Date.now() + 60000;
    }
});

ServerEvents.commandRegistry(event => {
    var Commands = event.commands;
    var Arguments = event.arguments;
    event.register(
        Commands.literal("moddcorplevelrestore").requires(src => src.hasPermission(2))
            .then(Commands.literal("player")
                .then(Commands.argument("target", Arguments.PLAYER.create(event))
                    .executes(ctx => {
                        var player = Arguments.PLAYER.getResult(ctx, "target");
                        if (!global.restorePlayerLevelCap(player)) {
                            ctx.source.sendFailure(LevelCapRecoveryComponent.literal("Recovery failed or the player is battling. Check the server log."));
                            return 0;
                        }
                        ctx.source.sendSuccess(() => LevelCapRecoveryComponent.literal("Checked " + player.username + "'s party for level recovery."), true);
                        return 1;
                    })
                )
            )
            .then(Commands.literal("all").executes(ctx => {
                var players = ctx.source.server.getPlayerList().getPlayers();
                var success = 0;
                var failed = 0;
                for (var i = 0; i < players.size(); i++) {
                    if (global.restorePlayerLevelCap(players.get(i))) success++;
                    else failed++;
                }
                if (failed) {
                    ctx.source.sendFailure(LevelCapRecoveryComponent.literal("Checked " + success + " players; " + failed + " could not be restored. Check the server log."));
                    return 0;
                }
                ctx.source.sendSuccess(() => LevelCapRecoveryComponent.literal("Checked " + success + " online players for level recovery."), true);
                return 1;
            }))
    );
});
