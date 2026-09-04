if (global.datagenDialog) {
  runNpcDatagen("nurse", {
    name: "Nurse Joy",
    unique: [
      { name: "advice_stage_0_0", text: "Your journey is just beginning! When your Pokémon are ready, your first challenge will be the Bug Gym in Silk Basin." },
      { name: "advice_stage_0_1", text: "It's wonderful to see a new Trainer setting out! The first Gym is in Silk Basin. Take some time to train your Pokémon before challenging it." },
      { name: "advice_stage_0_2", text: "If you're headed for Silk Basin, there's a cave in <insert name of starting town here> that will take you there. Be careful on the way!" },
      { name: "advice_stage_0_3", text: "How exciting! Your Pokémon journey is just beginning. Make sure your team gets plenty of training and rest before taking on the first Gym in Silk Basin." },
      { name: "advice_stage_0_4", text: "Before you challenge your first Gym, make sure all of your Pokémon are feeling their best. The Bug Gym in Silk Basin awaits!" },

      { name: "advice_stage_1_0", text: "Congratulations on your first Gym victory! Your next challenges are the Ground and Water Gyms. Head to the pier outside Silk Basin when you're ready." },
      { name: "advice_stage_1_1", text: "You've come a long way already! Now you'll need to prepare for both the Ground and Water Gyms. The pier outside Silk Basin is your next destination." },
      { name: "advice_stage_1_2", text: "You have an important choice ahead of you. You can travel to Archi or the Jewel of the Desert for your next Gym challenge." },
      { name: "advice_stage_1_3", text: "The Ground and Water Gyms will test your team in different ways. From the pier outside Silk Basin, you can sail to either Archi or the Jewel of the Desert." },
      { name: "advice_stage_1_4", text: "Before setting out, make sure your whole team is healthy and ready for the journey. The pier outside Silk Basin is your next stop." },

      { name: "advice_stage_2_0", text: "Archi should be your next destination. The Water Gym is located inside the hotel there. I hope you and your Pokémon have a wonderful journey!" },
      { name: "advice_stage_2_1", text: "The Water Gym in Archi will be your next challenge. Make sure your Pokémon are well-rested and prepared for the battle." },
      { name: "advice_stage_2_2", text: "Water-type battles can be quite demanding. Be sure to take good care of your Pokémon and keep them healthy before challenging the Gym in Archi." },
      { name: "advice_stage_2_3", text: "Before you leave for Archi, make sure your Pokémon are in good health. A well-rested team always has a better chance in battle." },
      { name: "advice_stage_2_4", text: "Good luck at the Water Gym in Archi! Trust your Pokémon, take care of them, and I'm sure you'll do wonderfully." },

      { name: "advice_stage_3_0", text: "There's still one challenge waiting for you: the Ground Gym at the Jewel of the Desert." },
      { name: "advice_stage_3_1", text: "The Ground Gym at the Jewel of the Desert will be your next challenge. Make sure your Pokémon are healthy and well-prepared before you go." },
      { name: "advice_stage_3_2", text: "Battles against Ground-type Pokémon can be tough on a team. Make sure your Pokémon get plenty of rest before challenging the Gym." },
      { name: "advice_stage_3_3", text: "Before heading to the Jewel of the Desert, take a moment to make sure your entire team is healthy. They'll need all their strength for the Gym battle." },
      { name: "advice_stage_3_4", text: "Good luck at the Jewel of the Desert! Take good care of your Pokémon, and I'm sure they'll give it their very best." },

      { name: "advice_stage_4_0", text: "Your next destination is Shiromori and Kuromori. The subway station in Chesno will take you there, where the Poison Gym awaits." },
      { name: "advice_stage_4_1", text: "The Poison Gym in Kuromori is your next challenge. Poison can be especially troublesome, so make sure your Pokémon are ready for the battle." },
      { name: "advice_stage_4_2", text: "Poison-type Pokémon can leave a team in rough shape if you're not careful. Please make sure your Pokémon are healthy before challenging the Gym in Kuromori." },
      { name: "advice_stage_4_3", text: "Before traveling to Kuromori, make sure everyone on your team is feeling their best. The Poison Gym will put them to the test." },
      { name: "advice_stage_4_4", text: "Good luck in Kuromori! Stay calm, look after your Pokémon, and remember that a Trainer and their team are strongest when they trust one another." },

      { name: "advice_stage_5_0", text: "Your next stop is Polaris. You can reach it by subway, and the Fire Gym is located there." },
      { name: "advice_stage_5_1", text: "The Fire Gym in Polaris is your next challenge. Make sure your Pokémon are healthy, rested, and ready for the heat!" },
      { name: "advice_stage_5_2", text: "Fire-type battles can be intense. Give your Pokémon plenty of rest before taking on the Gym in Polaris." },
      { name: "advice_stage_5_3", text: "Before you travel to Polaris, make sure your whole team is healthy. It's important to take good care of your Pokémon between battles." },
      { name: "advice_stage_5_4", text: "Good luck at the Fire Gym in Polaris! Stay cool, take care of your Pokémon, and give it your all!" },

      { name: "advice_stage_6_0", text: "Your next challenge awaits in the skies! The Electric Gym is in the flying city of <insert city name here>. You can reach it by Flying or by taking the blimp outside Chesno." },
      { name: "advice_stage_6_1", text: "The Electric Gym in <insert city name here> is your next challenge. Make sure your Pokémon are healthy and prepared before you make the journey into the sky." },
      { name: "advice_stage_6_2", text: "Electric-type battles can be unpredictable. Make sure your Pokémon are feeling their best before challenging the Gym in <insert city name here>." },
      { name: "advice_stage_6_3", text: "It's quite a journey to <insert city name here>, so make sure your Pokémon are well-rested before you set off. You'll want them at their best for the Gym." },
      { name: "advice_stage_6_4", text: "Good luck in <insert city name here>! I hope you and your Pokémon enjoy the view from up there. And remember to take good care of your team!" },

      { name: "advice_stage_7_0", text: "Your next challenge is the Nether Gym! It's located in a town inside a biodome. You can reach it through the Nether portal somewhere in Polaris." },
      { name: "advice_stage_7_1", text: "The Nether Gym is your next challenge. Don't let the location worry youâ€”the biodome town is quite safe. Just make sure your Pokémon are ready for battle!" },
      { name: "advice_stage_7_2", text: "The town around the Nether Gym is safely enclosed within a biodome, so you don't need to worry about the environment. Just make sure your Pokémon get plenty of rest before the battle." },
      { name: "advice_stage_7_3", text: "Once you find the Nether portal in Polaris, you'll be on your way. The town inside the biodome is perfectly safe, so you can focus on preparing your team for the Gym." },
      { name: "advice_stage_7_4", text: "Good luck at the Nether Gym! It's certainly an unusual place for a Gym, but the biodome keeps the town nice and safe. I'm sure you and your Pokémon will do wonderfully!" },

      { name: "advice_stage_8_0", text: "Oh my! The Normal Gym has closed down. ModdCorp in <insert starter town name here> has taken over, so you'll need to head back there for your next challenge." },
      { name: "advice_stage_8_1", text: "Your next challenge is the Normal Gym in <insert starter town name here>. Make sure your Pokémon are healthy and ready for another battle." },
      { name: "advice_stage_8_2", text: "Before challenging the Normal Gym in <insert starter town name here>, be sure your Pokémon have had plenty of time to rest and recover." },
      { name: "advice_stage_8_3", text: "You're headed back to <insert starter town name here> for the Normal Gym. Take good care of your Pokémon along the way, and make sure they're feeling their best when you arrive." },
      { name: "advice_stage_8_4", text: "Good luck at the Normal Gym in <insert starter town name here>! You've made it so far together. I'm sure your Pokémon will be proud to stand beside you." },

      { name: "advice_stage_9_0", text: "You've done it! You're ready to challenge the Pokémon League! Head to Battle Mountain. <insert instruction on how to get there>" },
      { name: "advice_stage_9_1", text: "The Pokémon League is waiting for you! This will be your greatest challenge yet, so make sure your entire team is healthy and prepared." },
      { name: "advice_stage_9_2", text: "The Pokémon League will put your team through quite a test. Please make sure your Pokémon are fully rested before you begin." },
      { name: "advice_stage_9_3", text: "Before heading to the Pokémon League, make sure every Pokémon on your team is healthy and ready to give their very best." },
      { name: "advice_stage_9_4", text: "Good luck at the Pokémon League! You've and your Pokémon have come so far together. Trust one another, and I'm sure you'll do wonderfully!" },

      { name: "advice_stage_10_0", text: "You did it! Congratulations! If you're looking for another challenge, you could visit the Battle Dojo in Kuromori... or perhaps build a Gym of your own!" },
      { name: "advice_stage_10_1", text: "You've accomplished so much! There's no need to rush into another challenge. Take some time to travel, enjoy yourself, and spend time with your Pokémon." },
      { name: "advice_stage_10_2", text: "Have you filled out your Pokédex yet? There are still so many wonderful Pokémon waiting to be discovered. I hope you'll meet them all!" },
      { name: "advice_stage_10_3", text: "If you're looking for a new challenge, I've heard the Battle Dojo in Kuromori attracts powerful Trainers from all over the world. Your Pokémon might enjoy the challenge!" },
      { name: "advice_stage_10_4", text: "You've beaten the Pokémon League! That's something to be proud of. Perhaps it's time for a quieter life with your Pokémon... Have you ever thought about starting a ranch?" }

    ],
    choiceDialogs: [
      {
        name: "need_to_heal",
        text: ["How can I help you today?",],
        options: [
          { text: "Heal Pokemon", command: "nurseheal" },
          { text: "What to do next", command: "nurseadvice" },
        ]
      }
    ]
  });
}
