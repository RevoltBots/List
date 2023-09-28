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
        revoltId: BotRaw._id,
      });
      let y = await botModel.find({ status: "approved" });
      let z = y.filter(n => n.owners.includes(BotRaw._id))
      if (x) {
        const embed = {
          title: BotRaw?.name || BotRaw._id, description: `Bio: "__${x.bio}__"\nDescription: ${x.description}\n\n| Github | Website | X | RBL |\n|----|----|----|----|\n|[GitHub](${x.github || "N/A"}) | [Website](${x.website || "N/A"})| [X](${x.twitter || "N/A"})|[RBL](https://revoltbots.org/users/${x.revoltId})|`, icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
        }
        let c = [];
        for (x in z){
        c.push(`| ${z[x].name} | ${z[x].status}|${z[x].certified}|[RBL](https://revoltbots.org/bots/${z[x].id})|`)
        }
        const embed2 = {
          title: BotRaw?.name || BotRaw._id, description: `User's Bots: ${z.length}\n\n
          ${z.length >= 1 ? "\n" +
              "|Name|Verified|Certified|URL|\n|----|----|----|----|----|\n"+`${c.join("\n")}`
              : ""}`, icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
        }
        message.reply({ embeds: [embed, embed2] })

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