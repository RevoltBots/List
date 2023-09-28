const ms = require("ms");
const reactions = ["🔔"];
module.exports = {
  name: "help",
  aliases: ["h"],
  category: "Info",
  description: "Commands list",
  async run(client, message, args) {
    try {
      const embed = {
        "title": message.author.username,
        "colour": message.member.hoistedRole.colour,
        "icon_url": message.author.generateAvatarURL({ size: 4096, }, true),
        "description": `| Command | Example | Description |\n|----------|----------|----------|\n| Vote | {prefix} vote <@Bot>  | vote for a bot on the list   |\n| bot   | {prefix} info <@Bot>   | shows bot information |\n| user   | {prefix} user <@user>   | shows user information |\n| help   | {prefix} help | shows this response. |\n| ping   | {prefix} ping | shows my latency information. |`
      }
      return message.reply({ embeds: [embed] })

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

function canUserVote(x) {
  const left = x.time - (Date.now() - x.date),
    formatted = ms(left, { long: true });
  if (left <= 0 || formatted.includes("-")) return { status: true };
  return { status: false, left, formatted };
}
