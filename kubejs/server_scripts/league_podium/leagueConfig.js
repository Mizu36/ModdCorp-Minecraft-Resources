console.info("[LEAGUE PODIUM] leagueConfig.js loaded");

/**
 * League Trainer Configuration
 *
 * Every League Podium stores a encounterId.
 *
 * Example:
 *
 * encounterId = "bug"
 *
 * The podium then looks up:
 *
 * global.leagueConfig["bug"]
 *
 */

global.leagueConfig = {

    //==============================================
    // Bug Gym (No Requirements)
    //==============================================

    bug_leader: {

        trainerId: "gym_bug_shino",
        displayName: "Gym Leader Shino",
        isLeader: true,
        canAverageLevel: true,
        averageAboveLevel: 18,

        requiredStages: ["gym_bug_trainer_01_complete"],
        blockedStages: [],
        rewardStages: ["gym_bug_complete"],
        removeStages: ["gym_bug_trainer_01_complete"],
        completedStage: "gym_bug_complete",
        gymCompletedStage: "gym_bug_complete",

        lockedMessage:
            "Defeat every trainer in my gym before challenging me.",
        blockedMessage: //Occurs when player tries to challenge but has a blocked stage
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (bug_leader blocked message)",
        completedMessage: //Occurs after the player has completed the encounter and tries to battle again before the npc respawns after battle
            "Our battle was intense. I can't wait to see you mature as a trainer! Come see me at the Battle Dojo if you want a rematch.",

        rewardItems: [
            {
                id: "sunlit_cobblemon:sunlit_league_medallion",
                count: 1,
            },
            {
                id: "simpletms:tm_electroweb",
                count: 1,
            }
        ],
        moneyReward: 3000,
        moneyLoss: 696,

        battle_music: ["sunlit:gym_swsh_battle"],

        onBattleStart: [], //Can be used to trigger commands when battle starts

        onBattleEnd: [], //Can be used to trigger commands when battle ends
        
        onVictory: [], //Can be used to trigger commands when player wins battle

    },

    bug_trainer_01: {
        
        trainerId: "gym_bug_trainer_01",
        displayName: "Bug Lover Franklavelt",
        isLeader: false,

        requiredStages: null,
        blockedStages: [],
        rewardStages: ["gym_bug_trainer_01_complete"],
        completedStage: "gym_bug_trainer_01_complete",
        gymCompletedStage: "gym_bug_complete",

        lockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (bug_trainer_01 locked message)",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (bug_trainer_01 blocked message)",
        completedMessage:
            "I can't believe you hurt my poor little friends. I hope you feel bad about it.",
        gymCompletedMessage:
            "I'm not surprised you beat the gym leader, you are a ruthless bug stomper after all. I hope you don't hurt any more bugs on your journey.",

        moneyReward: 1000,
        moneyLoss: 200,
    },

    //==============================================
    // Ground Gym (Requires Bug Gym beaten)
    //==============================================

    ground_leader: {

        trainerId: "gym_ground_ashley",
        displayName: "Gym Leader Ashley",
        isLeader: true,
        canAverageLevel: true,
        averageAboveLevel: 27,

        requiredStages: ["gym_ground_trainer_01_complete", "gym_ground_trainer_02_complete", "gym_ground_trainer_03_complete"],
        blockedStages: [],
        rewardStages: ["gym_ground_complete"],
        removeStages: ["gym_ground_trainer_01_complete", "gym_ground_trainer_02_complete", "gym_ground_trainer_03_complete"],
        completedStage: "gym_ground_complete",
        gymCompletedStage: "gym_ground_complete",

        lockedMessage:
            "Don't bother challenging me yet, you must first defeat all three of my trainers. You can find them in each tower.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (ground_leader blocked message)",
        completedMessage:
            "Thank you for the treat! Good luck on your journey!",

        rewardItems: [
            {
                id: "sunlit_cobblemon:sunlit_league_medallion",
                count: 1,
            },
            {
                id: "simpletms:tm_bulldoze",
                count: 1,
            }
        ],
        moneyReward: 4000,
        moneyLoss: 750,

        battle_music: ["sunlit:gym_swsh_battle"],
        
        onBattleStart: [],

        onBattleEnd: [],
        
        onVictory: [],
    },

    ground_trainer_01: {

        trainerId: "gym_ground_trainer_01",
        displayName: "Tower Keeper Kieran",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_ground_trainer_01_complete"],
        completedStage: "gym_ground_trainer_01_complete",
        gymCompletedStage: "gym_ground_complete",

        lockedMessage:
            "You are here a little early, go back to Silk Basin and defeat the gym there, then we'll talk.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (ground_trainer_01 blocked message)",
        completedMessage:
            "Hm, you ain't bad.",
        gymCompletedMessage:
            "Your battle against the chief was awesome!",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    ground_trainer_02: {

        trainerId: "gym_ground_trainer_02",
        displayName: "Tower Keeper Lilia",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_ground_trainer_02_complete"],
        completedStage: "gym_ground_trainer_02_complete",
        gymCompletedStage: "gym_ground_complete",

        lockedMessage:
            "I think you still need to battle the first gym, yeah?",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (ground_trainer_02 blocked message)",
        completedMessage:
            "Whew, that was a dangerous battle, maybe I should ask for a raise.",
        gymCompletedMessage:
            "I'm too scared to climb down, y'know? I hope you don't fall down the tower.",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    ground_trainer_03: {

        trainerId: "gym_ground_trainer_03",
        displayName: "Tower Keeper Borf",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_ground_trainer_03_complete"],
        completedStage: "gym_ground_trainer_03_complete",
        gymCompletedStage: "gym_ground_complete",

        lockedMessage:
            "SORRY! I CAN'T HEAR YOU OVER THE WIND! I THINK YOU NEED TO BATTLE THE FIRST GYM!",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (ground_trainer_03 blocked message)",
        completedMessage:
            "I COULDN'T FOCUS BECAUSE OF THIS HORRIBLE WIND. WHAT A TERRIBLE ENVIRONMENT TO BATTLE IN.",
        gymCompletedMessage:
            "IT'S SO WINDY UP HERE!",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    //==============================================
    // Water Gym (Requires Bug Gym beaten)
    //==============================================
    
    water_leader: {

        trainerId: "gym_water_kamiya",
        displayName: "Gym Leader Kamiya",
        isLeader: true,
        canAverageLevel: true,
        averageAboveLevel: 27,

        requiredStages: ["gym_water_trainer_01_complete", "gym_water_trainer_02_complete", "gym_water_trainer_03_complete"],
        blockedStages: [],
        rewardStages: ["gym_water_complete"],
        removeStages: ["gym_water_trainer_01_complete", "gym_water_trainer_02_complete", "gym_water_trainer_03_complete"],
        completedStage: "gym_water_complete",
        gymCompletedStage: "gym_water_complete",

        lockedMessage:
            "You missed a trainer or two in my gym, please defeat them before challenging me.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (water_leader blocked message)",
        completedMessage:
            "Looks like I have so much more to learn. Thank you for the experience.",

        rewardItems: [
            {
                id: "sunlit_cobblemon:sunlit_league_medallion",
                count: 1,
            },
            {
                id: "simpletms:tm_waterpulse",
                count: 1,
            }
        ],
        moneyReward: 4000,
        moneyLoss: 750,

        battle_music: ["sunlit:gym_swsh_battle"],

        onBattleStart: [],

        onBattleEnd: [],
        
        onVictory: [],
    },

    water_trainer_01: {

        trainerId: "gym_water_trainer_01",
        displayName: "Diver Kevin",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_water_trainer_01_complete"],
        completedStage: "gym_water_trainer_01_complete",
        gymCompletedStage: "gym_water_complete",

        lockedMessage:
            "Sorry small person, you can't be here without beating Silk Basin's gym first. Leave...",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (water_trainer_01 blocked message)",
        completedMessage:
            "For just a lil guy, you sure are strong. I hope you don't drown in the water gym... It'll be easier if you bring diving gear.",
        gymCompletedMessage:
            "I knew you could do it small person. Make sure you go beat those posers at the Jewel of the Desert gym, if you haven't already!",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    water_trainer_02: {

        trainerId: "gym_water_trainer_02",
        displayName: "Snorkler Sam",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_water_trainer_02_complete"],
        completedStage: "gym_water_trainer_02_complete",
        gymCompletedStage: "gym_water_complete",

        lockedMessage:
            "Uuuh, did Kevin not stop you? You haven't even been cleared to battle this gym yet. Silk Basin should be your first stop.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (water_trainer_02 blocked message)",
        completedMessage:
            "Snorkeling has failed me once again, mother was right...",
        gymCompletedMessage:
            "Hey, you beat Kamiya! And you didn't even use a snorkel!",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    water_trainer_03: {

        trainerId: "gym_water_trainer_03",
        displayName: "Surfer Plorb",
        isLeader: false,

        requiredStages: ["gym_bug_complete"],
        blockedStages: [],
        rewardStages: ["gym_water_trainer_03_complete"],
        completedStage: "gym_water_trainer_03_complete",
        gymCompletedStage: "gym_water_complete",

        lockedMessage:
            "You shouldn't be here...",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (water_trainer_03 blocked message)",
        completedMessage:
            "Thank you...",
        gymCompletedMessage:
            "Amazing...",

        moneyReward: 1500,
        moneyLoss: 500,
    },

    //==============================================
    // Grass/Poison Gym (Requires Ground and Water Gyms beaten)
    //==============================================

    poison_leader: {

        trainerId: "gym_poison_kinoko",
        displayName: "Gym Leader Kinoko",
        isLeader: true,
        canAverageLevel: true,
        averageAboveLevel: 35,

        requiredStages: ["gym_poison_trainer_01_complete", "gym_poison_trainer_02_complete", "gym_poison_trainer_03_complete"],
        blockedStages: [],
        rewardStages: ["gym_poison_complete"],
        removeStages: ["gym_poison_trainer_01_complete", "gym_poison_trainer_02_complete", "gym_poison_trainer_03_complete"],
        completedStage: "gym_poison_complete",

        lockedMessage:
            "Shroom... you haven't beaten all my spores yet. Find them in the maze and defeat them before you come challenge me.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (poison_leader blocked message)",
        completedMessage:
            "Ohh, what a bloom of a battle, shroom. Let's battle again one day shroom.",

        rewardItems: [
            {
                id: "sunlit_cobblemon:sunlit_league_medallion",
                count: 1,
            },
            {
                id: "simpletms:tm_venoshock",
                count: 1,
            }
        ],
        moneyReward: 7500,
        moneyLoss: 750,

        battle_music: ["sunlit:gym_swsh_battle"],

        onBattleStart: [],

        onBattleEnd: [],
        
        onVictory: [],
    },

    poison_trainer_01: {

        trainerId: "gym_poison_trainer_01",
        displayName: "Spore Kidd",
        isLeader: false,

        requiredStages: ["gym_ground_complete", "gym_water_complete"],
        blockedStages: [],
        rewardStages: ["gym_poison_trainer_01_complete"],
        completedStage: "gym_poison_trainer_01_complete",
        gymCompletedStage: "gym_poison_complete",

        lockedMessage:
            "Don't bother feeling your way around here, you haven't beaten enough gyms yet.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (poison_trainer_01 blocked message)",
        completedMessage:
            "Try feeling around for a staircase in the next room. It's more of a pillar though.",
        gymCompletedMessage:
            "How was your battle with Kinoko? Did you win?",

        moneyReward: 2850,
        moneyLoss: 1250,
    },

    poison_trainer_02: {

        trainerId: "gym_poison_trainer_02",
        displayName: "Spore Tanaka",
        isLeader: false,

        requiredStages: ["gym_ground_complete", "gym_water_complete"],
        blockedStages: [],
        rewardStages: ["gym_poison_trainer_02_complete"],
        completedStage: "gym_poison_trainer_02_complete",
        gymCompletedStage: "gym_poison_complete",

        lockedMessage:
            "You are here too early. Are you just practicing the maze?",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (poison_trainer_02 blocked message)",
        completedMessage:
            "Behind me is the path to the next trainer. If you are struggling, remember to slow down and feel around for the path. You should be able to avoid falling.",
        gymCompletedMessage:
            "It doesn't surprise me you were able to beat Kinoko. Half of her Pokemon aren't even Poison types, what a mockery...",

        moneyReward: 2850,
        moneyLoss: 1250,
    },

    poison_trainer_03: {

        trainerId: "gym_poison_trainer_03",
        displayName: "Spore Chanterelle",
        isLeader: false,

        requiredStages: ["gym_ground_complete", "gym_water_complete"],
        blockedStages: [],
        rewardStages: ["gym_poison_trainer_03_complete"],
        completedStage: "gym_poison_trainer_03_complete",
        gymCompletedStage: "gym_poison_complete",

        lockedMessage:
            "You got so far into the maze, but you haven't beaten enough gyms yet. Sorry, but please come back after you've challenged more gyms.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (poison_trainer_03 blocked message)",
        completedMessage:
            "Just head straight behind me, you'll fall straight into Kinoko's lair.",
        gymCompletedMessage:
            "Amazing! You were able to overcome Kinoko's mushroom themed party! Now the question is, how did she get an Amoonguss at that level?",

        moneyReward: 2850,
        moneyLoss: 1250,
    },
    //==============================================
    // Fire Gym (Requires Poison Gym beaten)
    //==============================================

    fire_leader: {

        trainerId: "gym_fire_tim",
        displayName: "Gym Leader Tim",
        isLeader: true,
        canAverageLevel: true,
        averageAboveLevel: 40,

        requiredStages: ["gym_fire_trainer_01_complete", "gym_fire_trainer_02_complete", "gym_fire_trainer_03_complete"],
        blockedStages: [],
        rewardStages: ["gym_fire_complete"],
        removeStages: ["gym_fire_trainer_01_complete", "gym_fire_trainer_02_complete", "gym_fire_trainer_03_complete"],
        completedStage: "gym_fire_complete",

        lockedMessage:
            "Taking a shortcut? You need to beat my peculiarly named trainers first.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (fire_leader blocked message)",
        completedMessage:
            "If somehow you lost your wrench, you can get a free replacement by the exit. Don't abuse my generosity.",

        rewardItems: [
            {
                id: "sunlit_cobblemon:sunlit_league_medallion",
                count: 1,
            },
            {
                id: "simpletms:burningjealousy",
                count: 1,
            }
        ],
        moneyReward: 7500,
        moneyLoss: 750,

        battle_music: ["sunlit:gym_swsh_battle"],

        onBattleStart: [],

        onBattleEnd: [],
        
        onVictory: [],
    },

    fire_trainer_01: {

        trainerId: "gym_fire_trainer_01",
        displayName: "The Architect",
        isLeader: false,

        requiredStages: ["gym_poison_complete"],
        blockedStages: [],
        rewardStages: ["gym_fire_trainer_01_complete"],
        completedStage: "gym_fire_trainer_01_complete",
        gymCompletedStage: "gym_fire_complete",

        lockedMessage:
            "Welcome trainer! Looks like you haven't beaten the Kuromori Gym yet. Please return after doing so.",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (fire_trainer_01 blocked message)",
        completedMessage:
            "Be careful on the chains. If you stop holding your wrench midway, you'll fall!",
        gymCompletedMessage:
            "I hope you had fun traversing the chains!",

        moneyReward: 3000,
        moneyLoss: 1500,
    },

    fire_trainer_02: {

        trainerId: "gym_fire_trainer_02",
        displayName: "The Pyromaniac",
        isLeader: false,

        requiredStages: ["gym_poison_complete"],
        blockedStages: [],
        rewardStages: ["gym_fire_trainer_02_complete"],
        completedStage: "gym_fire_trainer_02_complete",
        gymCompletedStage: "gym_fire_complete",

        lockedMessage:
            "Haha you can't be here, you'r not ready for my flames!",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (fire_trainer_02 blocked message)",
        completedMessage:
            "These chains were The Architect's idea. Don't worry too much about falling off, you'll probably die, but you won't fall into the lava.",
        gymCompletedMessage:
            "Our flames have been extinguished! :C",

        moneyReward: 3000,
        moneyLoss: 1500,
    },

    fire_trainer_03: {

        trainerId: "gym_fire_trainer_03",
        displayName: "The Inferno",
        isLeader: false,

        requiredStages: ["gym_poison_complete"],
        blockedStages: [],
        rewardStages: ["gym_fire_trainer_03_complete"],
        completedStage: "gym_fire_trainer_03_complete",
        gymCompletedStage: "gym_fire_complete",

        lockedMessage:
            "You think you can challenge The Inferno at your level? HA! Come back when you've beaten four other gyms!",
        blockedMessage:
            "If you are seeing this message, report it to Mizu on Discord. This is a bug. (fire_trainer_03 blocked message)",
        completedMessage:
            "The lava down there is covered up with the world's clearest glass, so you can safely admire the molten beauty without getting burned.",
        gymCompletedMessage:
            "The Inferno is impressed! You whipped up into a fire devil and blew this place down!",

        moneyReward: 3000,
        moneyLoss: 1500,
    },

    //==============================================
    // Electric Gym
    //==============================================
    //==============================================
    // Ice Gym
    //==============================================
    //==============================================
    // Normal Gym
    //==============================================

};