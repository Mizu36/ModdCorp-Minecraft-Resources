console.info("[SOCIETY] cobblemonHandleDeath.js loaded");

const getTrainerLevel = (player) => {
  let trainerLevel = 0;
  for (let index = 1; index <= 10; index++) {
    if (player.stages.has(`trainer_lvl_${index}`)) trainerLevel++;
    else break;
  }
  return trainerLevel;
};

// Battles started from NPC dialogs (/moddcorpbattle) have no trainer entity,
// so the encounter is tracked per player and a stand-in "trainer" is used.
global.pendingNpcBattles = global.pendingNpcBattles || {};

const safeEntity = (actor) => {
  try {
    return actor.getEntity ? actor.getEntity() : null;
  } catch (err) {
    return null;
  }
};

const makeNpcTrainerStub = (player, pending) => ({
  type: "rctmod:trainer",
  persistentData: { encounterId: pending.encounterId, badgeType: "none", levelTier: "normal" },
  isPlayer: () => false,
  getOnPos: () => player.getOnPos(),
});

global.handleCobblemonDefeat = (e) => {
  let loserName = "";
  e.losers.forEach((element) => {
    loserName = element.getName();
  });
  let isEon = !!(loserName && loserName.toString().includes("eon"));

  // Wild battles have no trainer/reward logic (Eon battles have their own rewards)
  let isWildBattle = false;
  e.battle.getActors().forEach((actor) => {
    if (String(actor.getType()) === "WILD") isWildBattle = true;
  });
  if (isWildBattle && !isEon) return;

  let winningPlayer;
  let losingPlayer;
  let loserLevels = [];
  // Actors are matched to a pending NPC battle through the player entity (non-player actors may have no entity)
  let pendingPlayer = null;
  let playerWon = false;
  e.winners.forEach((element) => {
    winningPlayer = safeEntity(element);
    if (winningPlayer && winningPlayer.isPlayer() && global.pendingNpcBattles[String(winningPlayer.uuid)]) {
      pendingPlayer = winningPlayer;
      playerWon = true;
    }
  });
  e.losers.forEach((element) => {
    losingPlayer = safeEntity(element);
    if (losingPlayer && losingPlayer.isPlayer() && global.pendingNpcBattles[String(losingPlayer.uuid)]) {
      pendingPlayer = losingPlayer;
      playerWon = false;
    }
    element.pokemonList.forEach((element) => {
      loserLevels.push(element.originalPokemon.getLevel());
    });
  });
  let pending = pendingPlayer ? global.pendingNpcBattles[String(pendingPlayer.uuid)] : null;
  console.info(`[NPC BATTLE] victory: pending=${pending ? pending.encounterId : "none"} playerWon=${playerWon}`);
  if (pending && pending.started) {
    delete global.pendingNpcBattles[String(pendingPlayer.uuid)];
    if (typeof global.showNpcBattleResult === "function") {
      global.showNpcBattleResult(pendingPlayer.getServer(), pendingPlayer, pending.encounterId, playerWon);
    }
    let stub = makeNpcTrainerStub(pendingPlayer, pending);
    if (playerWon) { winningPlayer = pendingPlayer; losingPlayer = stub; }
    else { losingPlayer = pendingPlayer; winningPlayer = stub; }
  }
  if (!isEon && (winningPlayer && winningPlayer.isPlayer()) && (losingPlayer && losingPlayer.isPlayer())) return;
  if (winningPlayer && winningPlayer.isPlayer()) {
    let reward = 0;
    loserLevels.forEach((loserLevel) => {
      let variance = Math.random() * (1.5 - 0.5) + 0.5;
      reward += Math.min(2000, Math.max(Math.round(loserLevel * 4 * getTrainerLevel(winningPlayer) * variance), 16));
    });
    if (losingPlayer && losingPlayer.type == "rctmod:trainer") {
      let leagueEncounter = global.getLeagueEncounter(losingPlayer);
      if (leagueEncounter){
        winningPlayer.persistentData.winStreak = winningPlayer.persistentData.winStreak || 0;
        winningPlayer.persistentData.bagItemsUsed = 0;

        global.handleLeagueBattleEnd(winningPlayer, losingPlayer.persistentData.encounterId);
        global.rewardLeagueEncounter(winningPlayer, losingPlayer.persistentData.encounterId);

        if (leagueEncounter.moneyReward) {
          global.depositIntoPersonalOrCurio(winningPlayer.level, winningPlayer, leagueEncounter.moneyReward);
          winningPlayer.getServer().runCommandSilent(global.getEmbersTextAPICommand(winningPlayer.username, `{anchor:"TOP_LEFT",background:1,color:"#FFFFFF",size:1,offsetY:68,offsetX:6,typewriter:1,align:"TOP_LEFT"}`, 160, Text.translatable("sunlit_cobblemon.win_reward", global.formatPrice(leagueEncounter.moneyReward)).toJson()));
        }
        return;
      } else {
          Utils.server.runCommandSilent("stopsound " + winningPlayer.username + " record");
      }
      let wins = winningPlayer.persistentData.wins;
      winningPlayer.persistentData.wins = wins || 0;
      winningPlayer.persistentData.wins++;
      winningPlayer.persistentData.bagItemsUsed = 0;
      wins++;
      winningPlayer.tell(Text.translatable("sunlit_cobblemon.trainer_podium.win_increased", `${Number(winningPlayer.persistentData.wins)}`).gold());
      reward = Math.min(5000, reward)
      let badge = losingPlayer.persistentData.badgeType;
      if (badge != "none") {
        reward *= 2;
        global.getTypeRewards(winningPlayer, losingPlayer.getOnPos(), badge);
      }
      if (wins % 10 == 0) {
        global.getWinsRewards(winningPlayer, losingPlayer.getOnPos(), wins);
      } 
      if (losingPlayer.persistentData.levelTier == "elite") {
        reward *= 2;
        if (wins % 15 == 0) {
          let reward = winningPlayer.level.createEntity("minecraft:item");
          reward.x = winningPlayer.getOnPos().x + 0.5;
          reward.y = winningPlayer.getOnPos().y + 0.4;
          reward.z = winningPlayer.getOnPos().z + 0.5;
          reward.item = "sunlit_cobblemon:sunlit_league_medallion";
          reward.spawn();
        }
      }
      if (winningPlayer && winningPlayer.stages.has("the_art_of_battle")) {
        reward *= 1.25
      } else if (winningPlayer && Math.random() < 0.01) {
        winningPlayer.give(Item.of("sunlit_cobblemon:the_art_of_battle"))
      }
    } else if (losingPlayer && isEon) {
      global.getEonRewards(winningPlayer, losingPlayer.getOnPos(), loserName.toString());
      winningPlayer.getServer().runCommandSilent(
        global.getEmbersTextAPICommand(
          winningPlayer.username,
          `{anchor:"TOP_LEFT",background:1,color:"#FFFFFF",size:1,offsetY:68,offsetX:6,typewriter:1,align:"TOP_LEFT"}`,
          160,
          "The wild team of Pokémon shared some of their treasure with you!"
        )
      );
    }
    reward = Math.round(reward);
    global.depositIntoPersonalOrCurio(winningPlayer.level, winningPlayer, reward);
    winningPlayer.getServer().runCommandSilent(global.getEmbersTextAPICommand(winningPlayer.username, `{anchor:"TOP_LEFT",background:1,color:"#FFFFFF",size:1,offsetY:68,offsetX:6,typewriter:1,align:"TOP_LEFT"}`, 160, Text.translatable("sunlit_cobblemon.win_reward", global.formatPrice(reward),).toJson()));
  } else if (
    winningPlayer && !winningPlayer.isPlayer() &&
    winningPlayer.type == "rctmod:trainer"
  ) {
    losingPlayer.persistentData.bagItemsUsed = 0;
    let leagueEncounter = global.getLeagueEncounter(winningPlayer);
    if (leagueEncounter) {
      losingPlayer.persistentData.bagItemsUsed = 0;
      global.handleLeagueBattleEnd(losingPlayer, winningPlayer.persistentData.encounterId);
      if (leagueEncounter.removeStagesOnLoss != null && leagueEncounter.removeStagesOnLoss.length > 0) {
        leagueEncounter.removeStagesOnLoss.forEach(stage => {losingPlayer.stages.remove(stage);});
      }
      if (leagueEncounter.moneyLoss != null){
        global.handleLeagueLoss(losingPlayer, leagueEncounter.moneyLoss);
      }
      return;
    } else {
        Utils.server.runCommandSilent("stopsound " + losingPlayer.username + " record");
    }
    global.handleLeagueFee(losingPlayer.getServer(), losingPlayer, "loss")
  }
};

StartupEvents.postInit((init) => {
  let $CobblemonEvents = Java.loadClass("com.cobblemon.mod.common.api.events.CobblemonEvents");

  // This version of rctmod ignores the "nickname" key, so apply nicknames from global.trainerNicknames
  // (generated from the trainer JSONs) before the battle packs its teams.
  try {
    $CobblemonEvents.BATTLE_STARTED_PRE.subscribe("normal", (e) => {
      let players = e.battle.getPlayers();
      if (players.length === 0) return;
      let pending = global.pendingNpcBattles[String(players[0].uuid)];
      if (!pending || !pending.trainerId || Date.now() - pending.requestedAt > 10000) return;
      let entries = global.trainerNicknames && global.trainerNicknames[pending.trainerId];
      let Component = Java.loadClass("net.minecraft.network.chat.Component");
      let used = {};
      // Nicknames are matched against the JSON levels, so this must run before the level override below.
      if (entries) e.battle.getActors().forEach((actor) => {
        if (String(actor.getType()) !== "NPC") return;
        actor.pokemonList.forEach((bp) => {
          let pk = bp.originalPokemon;
          let species = String(pk.species.resourceIdentifier.path);
          for (let i = 0; i < entries.length; i++) {
            let en = entries[i];
            if (used[i] || en.species !== species || en.level !== pk.level) continue;
            used[i] = true;
            if (en.nickname) {
              let name = Component.literal(en.nickname);
              pk.setNickname(name);
              if (bp.effectedPokemon !== pk) bp.effectedPokemon.setNickname(name);
            }
            break;
          }
        });
      });

      // Scale the trainer's team to the player's party based on averageAboveLevel in leagueConfig:
      // undefined or -1 = use team as is, 0 = always scale, N = scale only when the party average > N.
      // If the party's highest and lowest levels differ by more than 5, every Pokémon becomes highest - 2
      // instead of the average (anti-cheese).
      let encounter = global.leagueConfig && global.leagueConfig[pending.encounterId];
      let threshold = encounter ? encounter.averageAboveLevel : undefined;
      if (threshold === undefined || threshold === null || threshold < 0) return;
      let Cobblemon = Java.loadClass("com.cobblemon.mod.common.Cobblemon");
      let party = Cobblemon.INSTANCE.getStorage().getParty(players[0].uuid).toGappyList();
      let sum = 0, count = 0, hi = 0, lo = 1000;
      for (let i = 0; i < party.size(); i++) {
        let member = party.get(i);
        if (!member) continue;
        let lvl = member.getLevel();
        sum += lvl;
        count++;
        if (lvl > hi) hi = lvl;
        if (lvl < lo) lo = lvl;
      }
      if (count === 0) return;
      let avg = Math.round(sum / count);
      if (avg <= threshold) return;
      let target = hi - lo <= 5 ? avg : hi - 2;
      target = Math.max(1, Math.min(100, target));
      e.battle.getActors().forEach((actor) => {
        if (String(actor.getType()) !== "NPC") return;
        actor.pokemonList.forEach((bp) => {
          let pk = bp.originalPokemon;
          pk.setLevel(target);
          pk.heal();
          if (bp.effectedPokemon !== pk) {
            bp.effectedPokemon.setLevel(target);
            bp.effectedPokemon.heal();
          }
        });
      });
    });
  } catch (err) {
    console.warn("[NPC BATTLE] could not subscribe to BATTLE_STARTED_PRE: " + err);
  }

  $CobblemonEvents.BATTLE_STARTED_POST.subscribe("normal", (e) => {
    let players = e.battle.getPlayers();
    let trainer;

    e.battle.getActors().forEach((actor) => {
      let actorEntity = safeEntity(actor);
      if (actorEntity && actorEntity.type === "rctmod:trainer") {
        trainer = actorEntity;
      }
    });

    if (players.length === 0) return;

    let player = players[0];
    if (!trainer && e.battle.getActors().some((actor) => String(actor.getType()) === "WILD")) {
      global.runMusicForWildEncounter(player, e.battle);
      return;
    }

    let encounterId;
    if (trainer) {
      encounterId = trainer.persistentData.encounterId;
    } else {
      let pending = global.pendingNpcBattles[String(player.uuid)];
      if (!pending || Date.now() - pending.requestedAt > 10000) return;
      pending.started = true;
      encounterId = pending.encounterId;
    }
    if (encounterId) {
      global.runMusicForLeagueEncounter(player, encounterId);
      global.handleLeagueBattleStart(player, encounterId);
    } else {
      global.runMusicForEncounter(player);
    }
  });

  // Trainer-side Pokémon must not drop their held items on faint (wild Pokémon still do).
  // Cobblemon drops the held item in PokemonServerDelegate.updatePostDeath after the death animation,
  // so clearing it when the faint is reported in battle prevents the drop.
  try {
    $CobblemonEvents.BATTLE_FAINTED.subscribe("normal", (e) => {
      let killed = e.killed;
      let actor = killed.actor;
      if (String(actor.getType()) !== "NPC") return;
      killed.originalPokemon.removeHeldItem();
      killed.effectedPokemon.removeHeldItem();
      let entity = killed.entity;
      if (entity && entity.pokemon) entity.pokemon.removeHeldItem();
    });
  } catch (err) {
    console.warn("[NPC BATTLE] could not subscribe to BATTLE_FAINTED: " + err);
  }

  $CobblemonEvents.BATTLE_VICTORY.subscribe("normal", (e) => {
    global.handleCobblemonDefeat(e);
  });

  // Forfeits/flees don't fire a victory event, so clear the pending NPC battle here to free the NPC
  try {
    $CobblemonEvents.BATTLE_FLED.subscribe("normal", (e) => {
      e.battle.getPlayers().forEach((p) => {
        Utils.server.runCommandSilent("stopsound " + p.username + " music");
        Utils.server.runCommandSilent("stopsound " + p.username + " record");

        let pending = global.pendingNpcBattles[String(p.uuid)];
        if (pending && pending.started) {
          delete global.pendingNpcBattles[String(p.uuid)];
          global.handleLeagueBattleEnd(p, pending.encounterId);
        }
      });
    });
  } catch (err) {
    console.warn("[NPC BATTLE] could not subscribe to BATTLE_FLED: " + err);
  }
});
