// Card scanner: right click checks the required stage, then opens a dialog whose "Swipe card" button runs /moddcorpswipe

global.pendingCardScans = global.pendingCardScans || {};

global.cardScannerKey = (level, pos) => `scanner:${level.dimension}|${pos.x},${pos.y},${pos.z}`;

BlockEvents.rightClicked("moddcorp:card_scanner", (e) => {
  // e.cancel() exits the handler immediately, so the work runs first and the cancel (which stops the button press) comes last
  if (String(e.hand).toUpperCase() === "MAIN_HAND") {
    try {
      let player = e.player;
      let key = global.cardScannerKey(e.level, e.block.pos);
      let data = e.server.persistentData;
      let requiredStage = data.contains(key) ? String(data.getString(key)) : "";

      if (requiredStage !== "" && !player.stages.has(requiredStage)) {
        player.tell(Text.red("Access denied."));
      } else {
        global.pendingCardScans[String(player.uuid)] = {
          dimension: String(e.level.dimension),
          x: e.block.x,
          y: e.block.y,
          z: e.block.z,
          requestedAt: Date.now(),
        };
        e.server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} card_scanner_dialog`);
      }
    } catch (err) {
      console.error(`[CARD SCANNER] right click failed: ${err}`);
    }
  }
  e.cancel();
});

BlockEvents.broken("moddcorp:card_scanner", (e) => {
  let key = global.cardScannerKey(e.level, e.block.pos);
  if (e.server.persistentData.contains(key)) e.server.persistentData.remove(key);
});

ServerEvents.commandRegistry((event) => {
  const { commands: Commands, arguments: Arguments } = event;

  // /moddcorpscanner [stage]: places a card scanner on the block you are looking at, requiring the stage if given
  event.register(
    Commands.literal("moddcorpscanner")
      .requires((src) => src.hasPermission(2))
      .executes((ctx) => global.placeCardScanner(ctx.source.player, ""))
      .then(
        Commands.argument("stage", Arguments.STRING.create(event)).executes((ctx) =>
          global.placeCardScanner(ctx.source.player, Arguments.STRING.getResult(ctx, "stage"))
        )
      )
  );

  // Dialog button: presses the scanner the player last opened
  event.register(
    Commands.literal("moddcorpswipe").executes((ctx) => {
      let player = ctx.source.player;
      if (!player) return 0;
      return global.swipeCardScanner(player) ? 1 : 0;
    })
  );
});

global.placeCardScanner = (player, stage) => {
  if (!player) return 0;
  let hit = player.rayTrace(6);
  if (!hit || !hit.block) {
    player.tell(Text.red("Look at a block to place the card scanner on."));
    return 0;
  }
  let facing = String(hit.facing);
  let face = facing === "up" ? "floor" : facing === "down" ? "ceiling" : "wall";
  let target = hit.block.offset(hit.facing);
  target.set("moddcorp:card_scanner", {
    face: face,
    facing: face === "wall" ? facing : String(player.horizontalFacing),
    powered: "false",
  });
  let key = global.cardScannerKey(player.level, target.pos);
  if (stage && stage !== "") {
    player.server.persistentData.putString(key, stage);
    player.tell(Text.green(`Card scanner placed, requires stage "${stage}".`));
  } else {
    if (player.server.persistentData.contains(key)) player.server.persistentData.remove(key);
    player.tell(Text.green("Card scanner placed with no stage requirement."));
  }
  return 1;
};

global.swipeCardScanner = (player) => {
  let key = String(player.uuid);
  let pending = global.pendingCardScans[key];
  delete global.pendingCardScans[key];
  if (!pending || Date.now() - pending.requestedAt > 5 * 60 * 1000) return false;

  let level = player.level;
  if (String(level.dimension) !== pending.dimension) return false;
  let block = level.getBlock(pending.x, pending.y, pending.z);
  if (block.id !== "moddcorp:card_scanner") return false;
  let dx = Number(player.x) - (Number(pending.x) + 0.5);
  let dy = Number(player.y) - (Number(pending.y) + 0.5);
  let dz = Number(player.z) - (Number(pending.z) + 0.5);
  if (dx * dx + dy * dy + dz * dz > 64) return false;

  // Re-check the stage in case it changed since the dialog opened
  let data = player.server.persistentData;
  let scannerKey = global.cardScannerKey(level, block.pos);
  let requiredStage = data.contains(scannerKey) ? String(data.getString(scannerKey)) : "";
  if (requiredStage !== "" && !player.stages.has(requiredStage)) return false;

  if (String(block.properties.powered) === "true") return true;
  try {
    let state = block.blockState;
    state.block.press(state, level, block.pos);
  } catch (err) {
    console.error(`[CARD SCANNER] press failed: ${err}`);
    return false;
  }
  return true;
};
