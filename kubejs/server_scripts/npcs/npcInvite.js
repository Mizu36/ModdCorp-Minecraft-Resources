console.info("[SOCIETY] npcInvite.js loaded");

ItemEvents.rightClicked("society:nurse_invitation", e => {
  const { player, item } = e;

  if (!player.isCreative()) {
    e.cancel();
    return;
  }

  player.give(Item.of("society:villager_home", '{type:"nurse"}'));
  global.addItemCooldown(player, item, 4);
});

ItemEvents.rightClicked("society:clerk_invitation", e => {
  const { player, item } = e;

  if (!player.isCreative()) {
    e.cancel();
    return;
  }

  player.give(Item.of("society:villager_home", '{type:"clerk"}'));
  global.addItemCooldown(player, item, 4);
});

ItemEvents.rightClicked("society:subway_invitation", e => {
  const { player, item } = e;

  if (!player.isCreative()) {
    e.cancel();
    return;
  }

  player.give(Item.of("society:villager_home", '{type:"subway"}'));
  global.addItemCooldown(player, item, 4);
});

ItemEvents.rightClicked("society:shipmaster_invitation", e => {
  const { player, item } = e;

  if (!player.isCreative()) {
    e.cancel();
    return;
  }

  player.give(Item.of("society:villager_home", '{type:"shipmaster"}'));
  global.addItemCooldown(player, item, 4);
});

ItemEvents.rightClicked("society:aviator_invitation", e => {
  const { player, item } = e;

  if (!player.isCreative()) {
    e.cancel();
    return;
  }

  player.give(Item.of("society:villager_home", '{type:"aviator"}'));
  global.addItemCooldown(player, item, 4);
});

ItemEvents.rightClicked("society:invitation", (e) => {
  const { server, player, item } = e;
  if (player.isFake()) e.cancel();
  const inviteNbt = player.getHeldItem("main_hand").getNbt();

  if (inviteNbt) {
    let id = inviteNbt.get("type").id
    let baseId = id.substring(8, id.length);
    server.scheduleInTicks(0, () => {
      server.scheduleInTicks(1, () => {
        player.give(Item.of("society:villager_home", `{type:"${baseId}"}`))
      });
    });
    if (!player.stages.has(`invited_${baseId}`)) {
      player.stages.add(`invited_${baseId}`)
      player.tell(Text.translatable("society.invitation.place_home").green());
      if (baseId === "market") {
        player.tell(Text.translatable("society.new_villager.message").green());
      }
    }
    if (!player.isCreative()) item.count--;
    server.runCommandSilent(
      `playsound stardew_fishing:complete block @a ${player.x} ${player.y} ${player.z}`
    );
  } else {
    player.tell("Something went wrong! Tell Chakyl")
  }
  global.addItemCooldown(player, item, 4);
});
