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
  if (event.once == true) client.once(event.name, (...args) => event.execute(...args, client));
  if (!event.once || event.once == false) client.on(event.name, (...args) => event.execute(...args, client));
}

//-Commands-//
client.commands = new Collection();
client.aliases = new Collection();
client.memberMap = new Map();
client.eepy = sleep
this.userCache = [];
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


process.on("error", (err)=>{
	console.log(err.message)
})
process.on("unhandledRejection", (err)=>{
	console.log(err.message)
})
process.on("unhandledException", (err)=>{
	console.log(err.message)
})
process.on("warn", (err)=>{
	console.log(err.message)
})
