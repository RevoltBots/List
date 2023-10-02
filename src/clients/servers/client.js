const { Client } = require("revolt.js");
const { Collection } = require("discord.js");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const client = new Client();
const fs = require("node:fs");
const path = require("node:path");
var sleep = require('sleep');

//-Events-//
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  client.on(event.name, (...args) => event.execute(...args, client));
}

//-Commands-//
client.commands = new Collection();
client.aliases = new Collection();
client.memberMap = new Map();
client.eepy = sleep
this.userCache = [];
client.memberCount = (server) => {
  if (typeof server === "object") server = server.id;
  return client.memberMap.get(server)?.length;
}
client.mm = mapMembers;
// -- Function From Remix Bot --//
function mapMembers() {
  return new Promise(async res => {
    const evaluate = (data) => {
      data = data.map(v => v.value);
      data.forEach(members => {
        if (!members) return;
        const users = members.users;
        members = members.members;
        const server = members[0].server.id;
        members = members.map(m => m.id.user);
        this.memberMap.set(server, members);
      });
    }

    const promises = [];
    const servers = this.servers;
    console.log("Started mapping server members");
    for (let i = 0; i < servers.length; i++) {
      if (i % 30 === 0 && i !== 0) {
        evaluate(await Promise.allSettled(promises));
        console.log("Mapped " + Math.round((i / servers.length * 100)) + "%")
        promises.length = 0;
        await sleep.sleep(2);
      }
      await sleep.sleep(2);
      promises.push(servers[i].fetchMembers());
    }
    if (promises.length !== 0) evaluate(await Promise.allSettled(promises));
    console.log("Finished mapping server members!");
    res();
  });
}
const getFiles = (path) =>
  readdirSync(join(__dirname, path)).filter((file) => file.endsWith(".js"));
for (const cfile of getFiles("commands")) {
  const command = require(join(__dirname, "commands", `${cfile}`));
  client.commands.set(command.name, command);
  if (command.aliases)
    command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
}
global.sclient = client;
client.loginBot(config.clients.servers.token);

