console.info("[MODDCORP] townsfolk.js loaded");

const TownsfolkUUID = Java.loadClass("java.util.UUID");
const TownsfolkString = Java.loadClass("java.lang.String");
const TownsfolkResourceLocation = Java.loadClass("net.minecraft.resources.ResourceLocation");
const TownsfolkVec3 = Java.loadClass("net.minecraft.world.phys.Vec3");
const TownsfolkComponent = Java.loadClass("net.minecraft.network.chat.Component");
const TownsfolkPresetHandler = Java.loadClass("de.markusbordihn.easynpc.handler.PresetHandler");
const TownsfolkSkinHandler = Java.loadClass("de.markusbordihn.easynpc.handler.SkinHandler");
const TownsfolkSkinData = Java.loadClass("de.markusbordihn.easynpc.data.skin.SkinDataEntry");
const TOWNSFOLK_DATA_KEY = "moddcorp_townsfolk_dialog";

global.handleTownsfolkInteraction = (server, target, player) => {
    var data = target.persistentData;
    if (!data.contains(TOWNSFOLK_DATA_KEY)) return false;

    var family = String(data.getString(TOWNSFOLK_DATA_KEY));
    var dialogs = global.townsfolkDialogs && global.townsfolkDialogs[family];
    if (!dialogs || dialogs.length === 0) {
        console.error("[TOWNSFOLK] No dialogs registered for " + family + ".");
        player.tell("§cThis resident has no configured dialog. Check the server log.");
        return true;
    }

    var genericFamily = "generic_" + family;
    var genericDialogs = global.townsfolkDialogs[genericFamily];
    if (!genericDialogs) {
        console.error("[TOWNSFOLK] No generic dialog index registered for " + family + ".");
        player.tell("§cThis resident's dialog data is out of date. Check the server log.");
        return true;
    }
    if (genericDialogs.length > 0 && Math.random() < 0.5) dialogs = genericDialogs;

    var dialog = dialogs[Math.floor(Math.random() * dialogs.length)];
    if (Number(server.runCommandSilent(`dialog ${player.getUuid()} show ${player.username} ${dialog}`)) < 1) {
        console.error("[TOWNSFOLK] Could not show dialog " + dialog + " for " + player.username + ".");
        player.tell("§cCould not open this resident's dialog. Check the server log.");
    }
    return true;
};

function createTownsfolk(ctx, town, gender, age, category) {
    var player = ctx.source.player;
    if (!player) {
        console.error("[TOWNSFOLK] The create command must be run by a player.");
        return 0;
    }

    town = String(town).toLowerCase();
    gender = String(gender).toLowerCase();
    age = String(age).toLowerCase();
    category = String(category).toLowerCase();
    if (category === "townsfolk") category = "town";
    if (category === "cityfolk") category = "city";

    if (!/^[a-z0-9_]+$/.test(town) || !["male", "female"].includes(gender) ||
        !["adult", "child"].includes(age) || !["town", "city", "tourist"].includes(category)) {
        player.tell("§cUsage: /moddcorptownsfolk <town> <male|female> [adult|child] [town|city|tourist]");
        return 0;
    }

    var suffix = age === "child" ? "_child" : "";
    if (!global.townsfolkDialogs || !global.townsfolkDialogs[`townsfolk_${town}${suffix}`]) {
        player.tell("§cNo resident dialog is configured for that town.");
        return 0;
    }
    var dialogFamily = category === "town" ? `townsfolk_${town}${suffix}` :
        category === "city" ? `cityfolk${suffix}` : `tourist_${town}${suffix}`;
    if (!global.townsfolkDialogs || !global.townsfolkDialogs[dialogFamily] ||
        !global.townsfolkDialogs[dialogFamily].length) {
        player.tell("§cNo dialog is configured for that town and category.");
        return 0;
    }

    var model = gender === "male" ? "humanoid" : "humanoid_slim";
    var presetType = category === "town" ? "townsfolk" : category === "city" ? "cityfolk" : "tourist";
    var skinName = `${town}_${gender}${suffix}.png`;
    if (!global.townsfolkSkins || !global.townsfolkSkins.includes(`${model}/${skinName}`)) {
        player.tell(`§cNo configured Easy NPC skin for ${skinName}. Add it and regenerate the resident data.`);
        return 0;
    }
    var hit = player.rayTrace(6);
    if (!hit || !hit.block) {
        player.tell("§cLook at a block within 6 blocks to set the resident's home.");
        return 0;
    }

    var block = hit.block;
    var level = player.server.getLevel(new TownsfolkResourceLocation(String(player.level.dimension)));
    if (!level) {
        console.error("[TOWNSFOLK] Could not find the player's server level.");
        player.tell("§cCould not find your current dimension. Check the server log.");
        return 0;
    }
    var uuid = TownsfolkUUID.randomUUID();
    var preset = new TownsfolkResourceLocation(`easy_npc:preset/${model}/${presetType}_${gender}${suffix}.npc.nbt`);
    var position = new TownsfolkVec3(Number(block.x) + 0.5, Number(block.y) + 1, Number(block.z) + 0.5);
    var npc = null;
    try {
        var imported = TownsfolkPresetHandler.importCustomPreset(level, preset, position, uuid, null);
        npc = level.getEntity(uuid);
        if (!imported || !npc) throw new Error("Preset import did not produce the requested NPC.");
        var navigation = npc.getEasyNPCNavigationData();
        if (!navigation) throw new Error("NPC has no navigation data.");
        var skinUuid = TownsfolkUUID.nameUUIDFromBytes(new TownsfolkString(skinName).getBytes("UTF-8"));
        if (!TownsfolkSkinHandler.setSkin(npc, TownsfolkSkinData.createCustomSkin(skinUuid, false))) {
            throw new Error("Easy NPC could not set the skin.");
        }
        navigation.setHomePosition(block.pos);
        var name = category === "city" ? "cityfolk_chesno" : `townsfolk_${town}`;
        npc.setCustomName(TownsfolkComponent.translatable(`dialog.npc.${name}.name`));
        npc.persistentData.putString(TOWNSFOLK_DATA_KEY, dialogFamily);
    } catch (error) {
        if (npc) npc.discard();
        console.error(`[TOWNSFOLK] Failed to create ${preset}: ${error}`);
        player.tell("§cCould not create the resident. Check the server log and preset.");
        return 0;
    }
    player.tell(`§aCreated ${category} ${town} ${gender} ${age} resident.`);
    return 1;
}

ServerEvents.commandRegistry(event => {
    var Commands = event.commands;
    var Arguments = event.arguments;
    event.register(
        Commands.literal("moddcorptownsfolk").requires(src => src.hasPermission(2))
            .then(Commands.argument("town", Arguments.STRING.create(event))
                .then(Commands.argument("gender", Arguments.STRING.create(event))
                    .executes(ctx => createTownsfolk(ctx, Arguments.STRING.getResult(ctx, "town"), Arguments.STRING.getResult(ctx, "gender"), "adult", "town"))
                    .then(Commands.argument("ageOrCategory", Arguments.STRING.create(event))
                        .executes(ctx => {
                            var value = String(Arguments.STRING.getResult(ctx, "ageOrCategory")).toLowerCase();
                            return createTownsfolk(ctx, Arguments.STRING.getResult(ctx, "town"), Arguments.STRING.getResult(ctx, "gender"),
                                value === "adult" || value === "child" ? value : "adult",
                                value === "adult" || value === "child" ? "town" : value);
                        })
                        .then(Commands.argument("category", Arguments.STRING.create(event))
                            .executes(ctx => createTownsfolk(ctx, Arguments.STRING.getResult(ctx, "town"), Arguments.STRING.getResult(ctx, "gender"),
                                Arguments.STRING.getResult(ctx, "ageOrCategory"), Arguments.STRING.getResult(ctx, "category")))
                        )
                    )
                )
            )
    );
});
