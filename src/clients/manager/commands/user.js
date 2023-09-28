const ms = require("ms");
const reactions = ["🔔"];
module.exports = {
  name: "user",
  aliases: ["ui", "userinfo"],
  category: "BotList",
  description: "Check for a user on the botlist.",
  async run(client, message, args) {
    try {
      let userModel = require("../../../database/models/user");
      let botModel = require("../../../database/models/bot");

      let BotRaw;
      if (new RegExp(`(<@!?(.*)>)`).test(args[0])) {
        BotRaw = await client.users.fetch(
          args[0].match(new RegExp(`(<@!?(.*)>)`))[2]
        );
      } else {
        BotRaw = await client.users.fetch(args[0]).catch(() => {
          BotRaw = false;
        });
      }
      if (!BotRaw || BotRaw.bot)
        return message.reply("This is not a real user. :hmm:");

      let x = await userModel.findOne({
        user: BotRaw.id,
      });
      let y = await botModel.find({ owners: BotRaw.id})
      // y.filter(f => {
      //   f.owners.includes(BotRaw.id)
      // });

      let bots;
      if (y) {
        await y.forEach(b => {
          bots.push([b.id, b.name, b.status, b.certified])
        });
      }
      console.log(y)
      if (x) {
        const embed = {
          title: `${BotRaw.name}`, description: `Bio: "__${x.bio}__"\n\nDescription: ${x.description}
          | Github | Website | X | RBL |
          |----|----|----|----|
          |[GitHub](${x.github || "N/A"}) | [Website](${x.website || "N/A"})| [X](${x.twitter || "N/A"})|[RBL](https://revoltbots.org/users/${x.revoltId})|
          `, icon_url: BotRaw.user.generateAvatarURL({ size: 4096 }, true)
        }

        const embed2 = {
          title: `${BotRaw.name}`, description: `Users Bots: ${bots?.length}
          | ID | Name | Verified | URL |
          |----|----|----|----|
          |[GitHub](${x.github || "N/A"}) | [Website](${x.website || "N/A"})| [X](${x.twitter || "N/A"})|[RBL](https://revoltbots.org/users/${x.revoltId})|
          `, icon_url: BotRaw.user.generateAvatarURL({ size: 4096 }, true)
        }
        message.reply({ embeds: [embed] })

      }
    } catch (err) {
      console.error(err);
      message.channel.stopTyping();
      await message.reply({
        embeds: [
          {
            description: `:x: There was an error while executing this command! \n\`\`\`js\n${err}\`\`\``,
            colour: "#ff4654",
          },
        ],
      });
    }
  },
};