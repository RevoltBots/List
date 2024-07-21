
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.info(`[INFO] ${client.user.username} is logged in and ready.`);
    global.ServerClient = client;
  },
};
