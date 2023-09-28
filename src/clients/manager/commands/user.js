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
      const botModel = require("../../../database/models/bot");
      let y = await botModel.find({status: "approved"});
      let z = y.filter(n =>n.owners.includes("01FEZ476PJPQATRTYVKRXBGFRE"))
      let bots;
      if (z) {
        await z.forEach(b => {
          bots.push([b])
        });
      }
      console.log(z)
      if (x) {
        const embed = {
          title: `${BotRaw.name}`, description: `Bio: "__${x.bio}__"\n\nDescription: ${x.description}
          | Github | Website | X | RBL |
          |----|----|----|----|
          |[GitHub](${x.github || "N/A"}) | [Website](${x.website || "N/A"})| [X](${x.twitter || "N/A"})|[RBL](https://revoltbots.org/users/${x.revoltId})|
          `, icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
        }
        const embed2 = {
          title: `${BotRaw.name}`, description: `Users Bots: ${bots?.length}
          ${bots.length >= 1 ? "" +
          "       | ID | Name | Verified | Certified | URL |" +
              bots.forEach(botInfo => {
                  "       |----|----|----|----| " +
                  `       | ${bots.id} | [Website](${bots.name || "N/A"})| [X](${bots.status || "N/A"})| (${bots.certifed || "N/A"}) |[RBL](https://revoltbots.org/users/${bots.id})|`
              }) : ""}
          `, icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
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