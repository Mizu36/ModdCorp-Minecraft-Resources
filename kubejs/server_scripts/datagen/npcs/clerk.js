if (global.datagenDialog) {
  runNpcDatagen("clerk", {
    name: "Clerk Clark",
    unique: [
      { name: "advice_stage_0_0", text: "Just starting your journey? Your first big challenge is the Bug Gym in Silk Basin. I'd get your team battle-ready before you head over." },
      { name: "advice_stage_0_1", text: "Ah, a new Trainer! Your first Gym challenge is in Silk Basin. Take your time, train your Pokémon, and you'll be ready in no time." },
      { name: "advice_stage_0_2", text: "Looking for Silk Basin? There's a cave in <insert name of starting town here> that'll lead you right there. Handy, isn't it?" },
      { name: "advice_stage_0_3", text: "How exciting! Your journey is just beginning. Give your team plenty of training before taking on the first Gym in Silk Basin." },
      { name: "advice_stage_0_4", text: "Here's a little advice from someone who sells potions for a living: stock up before you take on the first Gym in Silk Basin!" },

      { name: "advice_stage_1_0", text: "Made it past the Bug Gym? Nice work! Your next challenges are the Ground and Water Gyms. You'll find a pier just outside Silk Basin that'll get you started." },
      { name: "advice_stage_1_1", text: "Now that you've cleared the Bug Gym, it's time to prepare for the Ground and Water Gyms. The pier outside Silk Basin is your next stop." },
      { name: "advice_stage_1_2", text: "You've got a choice this time! You can head to Archi or the Jewel of the Desert for your next Gym challenge." },
      { name: "advice_stage_1_3", text: "You'll want a team that can handle both Ground and Water types. Ships from the pier outside Silk Basin can take you to Archi or the Jewel of the Desert." },
      { name: "advice_stage_1_4", text: "Before you set sail, take a peek in your Bag. Potions, status cures... the usual. The pier outside Silk Basin is where you'll want to go next." },

      { name: "advice_stage_2_0", text: "Heading to Archi? The Water Gym is inside the hotel there. Can't miss it... well, you could, but it's a rather large hotel." },
      { name: "advice_stage_2_1", text: "The Water Gym in Archi is your next challenge. Make sure your team is prepared, and don't forget to stock up before you go." },
      { name: "advice_stage_2_2", text: "A Water Gym can be a real splash! I'd bring plenty of healing items before you challenge the Gym in Archi." },
      { name: "advice_stage_2_3", text: "I'd check your Bag before leaving for Archi. You don't want to discover you're out of Potions halfway through the Water Gym." },
      { name: "advice_stage_2_4", text: "Good luck in Archi! Give your team a good rest, stock up on supplies, and you'll be ready for that Water Gym." },

      { name: "advice_stage_3_0", text: "Don't forget about the Ground Gym at the Jewel of the Desert. That's the other challenge waiting for you." },
      { name: "advice_stage_3_1", text: "The Ground Gym at the Jewel of the Desert is up next. Make sure your team is ready before you take on the challenge." },
      { name: "advice_stage_3_2", text: "Ground-type battles can really wear a team down. I'd bring plenty of healing items to the Jewel of the Desert." },
      { name: "advice_stage_3_3", text: "Before heading to the Jewel of the Desert, check your Bag and restock anything you're running low on. Especially Potions!" },
      { name: "advice_stage_3_4", text: "Best of luck at the Jewel of the Desert! Get your team rested and ready before taking on the Ground Gym." },

      { name: "advice_stage_4_0", text: "Your next destination is Shiromori and Kuromori. There's a subway station in Chesno that'll take you straight there. The Poison Gym awaits!" },
      { name: "advice_stage_4_1", text: "The Poison Gym in Kuromori is next. Poison can be tricky, so make sure your team is prepared before you head in." },
      { name: "advice_stage_4_2", text: "I'd make sure you've got plenty of healing items before taking on the Poison Gym in Kuromori. Poison battles can get messy!" },
      { name: "advice_stage_4_3", text: "Going to Kuromori? Check your Bag first and stock up on anything you're missing. Better safe than poisoned, I always say." },
      { name: "advice_stage_4_4", text: "Good luck in Kuromori! Rest up, stock up, and make sure your team is ready for the Poison Gym." },

      { name: "advice_stage_5_0", text: "Your next stop is Polaris. Hop on the subway and you'll find the Fire Gym waiting for you there." },
      { name: "advice_stage_5_1", text: "The Fire Gym in Polaris is your next challenge. Make sure your team is rested and you've got everything you need before heading out." },
      { name: "advice_stage_5_2", text: "I'd bring plenty of healing items to Polaris. Fire-type battles have a way of heating things up!" },
      { name: "advice_stage_5_3", text: "Before you take the subway to Polaris, check your Bag. Running out of supplies is a lot less fun than running out of Fire-resistant Pokémon!" },
      { name: "advice_stage_5_4", text: "Good luck in Polaris! Get your team in fighting shape and don't forget to stock up before challenging the Fire Gym." },

      { name: "advice_stage_6_0", text: "Your next challenge is the Electric Gym in the flying city of <insert city name here>. You can fly there with a Pokémon or take the blimp outside Chesno." },
      { name: "advice_stage_6_1", text: "The Electric Gym in <insert city name here> is next. Make sure your team is ready before you head up into the skies." },
      { name: "advice_stage_6_2", text: "I'd stock up on healing items before visiting <insert city name here>. You don't want your team running on empty during an Electric battle!" },
      { name: "advice_stage_6_3", text: "Heading to <insert city name here>? Check your Bag before you go. It's quite a trip, so make sure you've got everything you need." },
      { name: "advice_stage_6_4", text: "Good luck in <insert city name here>! Prepare your team well before taking on the Electric Gym in the sky." },

      { name: "advice_stage_7_0", text: "The next Gym is in the Nether. There's a Nether portal somewhere in Polaris that'll get you there. Just... be careful." },
      { name: "advice_stage_7_1", text: "The Nether Gym is no ordinary Gym challenge. Make sure your team is prepared, and maybe bring a few extra supplies. Just in case." },
      { name: "advice_stage_7_2", text: "I'd definitely bring plenty of healing items to the Nether Gym. Things have a tendency to get rather heated down there." },
      { name: "advice_stage_7_3", text: "Before heading through that portal in Polaris, check your Bag. Once you're in the Nether, you'll be glad you brought everything you need." },
      { name: "advice_stage_7_4", text: "Good luck in the Nether! Keep your team healthy, watch your step, and don't forget where you parked your way back." },

      { name: "advice_stage_8_0", text: "Well, this is an unusual one. The Normal Gym has closed down, and ModdCorp in <insert starter town name here> has taken over. Looks like you'll be heading back home!" },
      { name: "advice_stage_8_1", text: "The Normal Gym is now being run by ModdCorp in <insert starter town name here>. Make sure your team is ready before you take on the challenge." },
      { name: "advice_stage_8_2", text: "Before challenging the Normal Gym in <insert starter town name here>, I'd stock up on healing items. You know the drill by now!" },
      { name: "advice_stage_8_3", text: "Heading back to <insert starter town name here>? Check your Bag first and make sure you're stocked up for the Normal Gym." },
      { name: "advice_stage_8_4", text: "Good luck with the Normal Gym in <insert starter town name here>! You've come a long way, so make sure your team is ready for one more challenge." },

      { name: "advice_stage_9_0", text: "Would you look at that... you're ready for the Pokémon League! Head to Battle Mountain. <insert instruction on how to get there>" },
      { name: "advice_stage_9_1", text: "You've made it all the way to the Pokémon League! Make sure your team is at its best and prepare carefully. This is no ordinary Gym battle." },
      { name: "advice_stage_9_2", text: "The League is a long road, so bring plenty of healing items. You won't regret having a few extra Potions in your Bag." },
      { name: "advice_stage_9_3", text: "Before you head to the Pokémon League, give your Bag one last check. Stock up, heal your team, and make sure you're ready for anything." },
      { name: "advice_stage_9_4", text: "Best of luck at the Pokémon League! You've made it this far. Now show them what you and your Pokémon can do!" },

      { name: "advice_stage_10_0", text: "You did it! Congratulations! If you're looking for your next challenge, try the Battle Dojo in Kuromori... or perhaps build a Gym of your own?" },
      { name: "advice_stage_10_1", text: "You've conquered the League, so there's no rush anymore. Take a breather, explore the world, or see how you fare against other Trainers." },
      { name: "advice_stage_10_2", text: "Now that you've reached the top, how's that Pokédex looking? There are plenty of Pokémon out there waiting to be discovered!" },
      { name: "advice_stage_10_3", text: "If you're looking for a real challenge, I've heard the Battle Dojo in Kuromori attracts strong Trainers from all over the world. Might be worth a visit." },
      { name: "advice_stage_10_4", text: "You've beaten the Pokémon League! Maybe it's time to settle down a little. Have you ever considered starting a ranch?" }

    ],
    choiceDialogs: [
      {
        name: "need_to_buy",
        text: ["What would you like to purchase?",],
        options: [
          { text: "Shop", command: "clerkshop" },
          { text: "What to do next", command: "clerkadvice" },
        ]
      }
    ]
  });
}