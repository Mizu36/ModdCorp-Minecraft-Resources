const WHISTLE_ID = "moddcorp:legendary_whistle";
const WHISTLE_POKEMON_LEVEL = 70;
const WhistlePokemonProperties = Java.loadClass("com.cobblemon.mod.common.api.pokemon.PokemonProperties");

function createWhistle(cobblemon) {
    let pretty = String(cobblemon).split(/[\s_-]+/)
        .map(w => String(w).charAt(0).toUpperCase() + String(w).slice(1))
        .join(" ");
    return Item.of(WHISTLE_ID, `{Cobblemon:"${cobblemon}"}`)
        .withName(Text.of("Legendary Whistle (" + pretty + ")").italic(false));
}

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal("whistle")
            .requires(src => src.hasPermission(2))
            .then(
                Commands.literal("give")
                    .then(
                        Commands.argument("cobblemon", Arguments.STRING.create(event))
                            .executes(ctx => {
                                let player = ctx.source.player;
                                if (!player) return 0;

                                let name = ctx.getArgument("cobblemon", Java.loadClass("java.lang.String"));
                                player.give(createWhistle(name.toLowerCase()));
                                player.tell("§aGave a whistle bound to §e" + name);
                                return 1;
                            })
                    )
            )
            .then(
                Commands.literal("givetarget")
                    .then(
                        Commands.argument("target", Arguments.PLAYER.create(event))
                            .then(
                                Commands.argument("cobblemon", Arguments.STRING.create(event))
                                    .executes(ctx => {
                                        let target = Arguments.PLAYER.getResult(ctx, "target");
                                        let name = ctx.getArgument("cobblemon", Java.loadClass("java.lang.String"));
                                        global.giveWhistle(target, name);
                                        return 1;
                                    })
                            )
                    )
            )
    );
});

// Entry point for NPC/trainer reward scripts.
global.giveWhistle = function (player, cobblemon) {
    player.give(createWhistle(String(cobblemon).toLowerCase()));
};

ItemEvents.rightClicked(WHISTLE_ID, event => {
    const { player, level, item, hand } = event;

    if (level.isClientSide() || hand != "main_hand") return;

    let nbt = item.nbt;
    let name = nbt && nbt.contains("Cobblemon") ? String(nbt.getString("Cobblemon")) : "";

    if (!name) {
        player.tell("§cThis whistle has no Cobblemon bound to it.");
        return;
    }

    let entity;
    try {
        entity = WhistlePokemonProperties.Companion.parse(name + " level=" + WHISTLE_POKEMON_LEVEL).createEntity(level);
    } catch (e) {
        entity = null;
    }

    if (!entity) {
        player.tell("§cUnknown Cobblemon: " + name);
        return;
    }

    // Place it two blocks ahead on the horizontal plane, facing the player.
    let look = player.getLookAngle();
    let len = Math.sqrt(look.x() * look.x() + look.z() * look.z()) || 1;
    let x = Number(player.getX()) + (look.x() / len) * 2;
    let z = Number(player.getZ()) + (look.z() / len) * 2;
    let y = Number(player.getY());

    entity.setPos(x, y, z);
    entity.setYRot(Number(player.getYRot()) + 180);

    let added = level.addFreshEntity(entity);

    if (!added) {
        player.tell("§cThe Cobblemon couldn't be summoned here.");
        return;
    }

    item.shrink(1);
    event.cancel();
});
