
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.info(`[INFO] ${client.user.username} is logged in and ready.`);
    global.ServerClient = client;
/*    client.users.edit({
      status: {
        text: "Watching de serverlist",
        presence: "Focus",
      },
    });
*/
//    sclient.mm.call(sclient);
  },
};
