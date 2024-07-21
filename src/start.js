global.config = require("../config.js");
global.logSend = async (embed = {})=>{
        await client.channels.get(global.config.channels.weblogs).sendMessage({ content:`<@${config.ownerids[0]}>`, embeds: embed});
}
require("./clients/manager/client.js");
require("./clients/servers/client.js");
require("./database/connect.js");
require("./server/app.js");

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
process.on("SIGINT", async()=>{
	await logSend([{title: "> RBL is currently DOWN!", colour: "#FF0000"}])
	process.exit(1)
})
