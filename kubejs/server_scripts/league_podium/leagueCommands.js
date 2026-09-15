console.info("[LEAGUE] leagueCommands.js loaded");

ServerEvents.commandRegistry(event => {

    const { commands: Commands, arguments: Arguments, Suggestions } = event;

    event.register(

        Commands.literal("league")

            .requires(source => source.hasPermission(2))

            .then(
                Commands.literal("give")
                    .then(
                        Commands.argument(
                            "encounterId",
                            Arguments.STRING.create(event)
                        )
                        .suggests((ctx, builder) => {

                            const ids = Object.keys(global.leagueConfig);

                            for (const id of ids) {
                                builder.suggest(id);
                            }

                            return builder.buildFuture();

                        })
                        .executes(ctx => {

                            const player = ctx.source.playerOrException;
                            const encounterId = Arguments.STRING.getResult(ctx, "encounterId");

                            const encounter = global.leagueConfig[encounterId];

                            if (!encounter) {
                                player.tell(Text.red("Unknown League encounter: " + encounterId));
                                return 0;
                            }

                            player.give(
                                Item.of(
                                    "sunlit_cobblemon:trainer_podium",
                                    `{LeagueMode:1b,encounterId:"${encounterId}"}`
                                )
                            );

                            player.tell(
                                Text.green("Given League Podium for encounter: " + encounterId)
                            );

                            return 1;

                        })
                    )
            )
    );

});