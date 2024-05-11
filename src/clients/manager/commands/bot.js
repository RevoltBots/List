const ms = require("ms");
const reactions = ["🔔"];
module.exports = {
  name: "bot",
  aliases: ["bi", "botinfo"],
  category: "BotList",
  description: "Check for a user on the botlist.",
  async run(client, message, args) {
    try {
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
      if (!BotRaw || !BotRaw.bot) return message.reply("This is not a real bot. :hmm:");

      let x = await botModel.findOne({
       id: BotRaw._id,
      });
      if (x) {
        const embed = {
          title: BotRaw?.name || BotRaw._id, description: `Description: ${x.description}`, icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
        }
        let c = `| ${x.name} | ${x.prefix ||""}| ${x.status}|${x.certified}|${x.monthlyVotes || 0}:${x.votes}|${x.servers || "N/A"}|[RBL](https://revoltbots.org/bots/${x.id})|`
        const embed2 = {
          title: BotRaw?.name || BotRaw._id, description: "|Name|Prefix|Verified|Certified|Votes|Servers|URL|\n|----|----|----|----|----|----|----|\n"+`${c}`,
	 icon_url: BotRaw.generateAvatarURL({ size: 4096 }, true)
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
