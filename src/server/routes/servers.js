const express = require("express");
const router = express.Router();
const serverModel = require("../../database/models/server");
const userModel = require("../../database/models/user");
const reportModel = require("../../database/models/report");
const moment = require("moment");
const ms = require("ms");
router.get('/', async (req, res) => {
  let servers = await serverModel.find({
    banned: false
  });

  for (let i = 0; i < servers.length; i++) {
    servers[i].tags = servers[i].tags.join(", ");
  }

  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await global.sclient?.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  res.render("servers/index.ejs", { user, servers })
})
router.get("/submit", async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await global.sclient.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  res.render("servers/submit.ejs", {
    user,
    tags: config.tags.servers,
  });
});
router.post("/search", async (req, res) => {
  let botDesc = await serverModel.find({
    banned: false,
    description: { $regex: `${req.body.q}`, $options: "i" },
  });
  let botName = await serverModel.find({
    banned: false,
    name: { $regex: `${req.body.q}`, $options: "i" },
  });
  let botShort = await serverModel.find({
    banned: false,
    shortDesc: { $regex: `${req.body.q}`, $options: "i" },
  });
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  let srv =
    botDesc.length >= 1
      ? botDesc
      : botShort.length >= 1
        ? botShort
        : botName.length >= 1
          ? botName
          : [];
  for (let i = 0; i < srv.length; i++) {
    srv[i].tags = srv[i].tags.join(", ");
  }
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  if (srv == null || srv.length == 0)
    return res.render("servers/search.ejs", {
      error: "No servers could not be found on our list with specified term.",
      srv: srv || null,
      tag: req.query.q || null,
      user: user || null,
    });
  res.render("servers/search.ejs", {
    user: user || null,
    srv,
    error: null,
    tag: req.params.tag,
  });
});

router.get("/tags/:tag", async (req, res) => {
  let srv = await serverModel.find({
    tags: { $regex: `^${req.params.tag}$`, $options: "i" },
  });
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  for (let i = 0; i < srv.length; i++) {
    srv[i].tags = srv[i].tags.join(", ");
  }
  let bot = srv;
  if (srv.length == 0)
    return res.render("servers/search.ejs", {
      error: "No Servers could not be found on our list with specified tag.",
      srv: srv || null,
      tag: req.params.tag || null,
      user: user || null,
    });
  res.render("servers/search.ejs", {
    user: user || null,
    srv,
    error: null,
    tag: req.params.tag.toUpperCase(),
  });
});

router.get('/:id', async (req, res) => {
  let servers = await serverModel.findOne({ id: req.params.id }) || await serverModel.findOne({ vanity: req.params.id.toLowerCase() })

  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await global.sclient.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  if (!servers || servers == null) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: "This server could not be found on our list.",
  }
  )
  cli = global.sclient
  res.render("servers/view.ejs", { moment, user, servers,cli })
})

router.get("/:id/edit", async (req, res) => {
  let bot = await serverModel.findOne({ id: req.params.id }) || await serverModel.findOne({ vanity: req.params.id.toLowerCase() })
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(req.session.userAccountId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
    if (!bot || bot == null) return res.status(404).render(
      "error.ejs", {
      user,
      code: 404,
      message: "This server could not be found on our list.",
    }
    )
  if (!bot.owners.includes(user.revoltId)) return res.redirect("/");
  res.render("servers/edit.ejs", {
    user: user || null,
    botclient: client,
    tags: config.tags.servers,
   bot,
  });
});

router.post("/:id/edit", async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  const data = req.body;
  if (!data) return res.status(400).json("You need to provide the servers's information.");
  let bot = await serverModel.findOne({ id: req.params.id }) || await serverModel.findOne({vanity: req.params.id.toLowerCase()});
  if (!bot || bot == null) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: "This server could not be found on our list.",
  }
  )
  if (!bot.owners.includes(req.session.userAccountId)) return res.redirect("/");
  let BotRaw = await client.servers.fetch(req.params.id).catch((err) => {
    console.log(err);
  });

  if (!BotRaw) return res.status(404).render(
      "error.ejs", {
      user,
      code: 404,
      message: "The provided server couldn't be found on Revolt.",
    }
    )
  if (data.owners) {
    let owners = [];
    owners.push(req.session.userAccountId);

    data.owners.split(" ").forEach((owner) => {
      owners.push(owner);
    });
    data.owners = owners;
  }
  if (data.owners) {
    data.owners.forEach(async (owner) => {
      try {
        await client.users.get(owner);
      } catch (e) {
        return res.status(409).render(
          "error.ejs", {
          user,
          code: 409,
          message: "One of your owners is not a real user, or isn't in our server",
        }
        )
      }
    });
  }
  if (data.tags) bot.tags = data.tags;
  if (data.owners) bot.owners = data.owners;
  if (data.invite) bot.invite = data.invite;
  if (data.vanity) bot.vanity = data.vanity;
  if (data.desc) bot.description = data.desc;
  if (data.shortDesc) bot.shortDesc = data.shortDesc;
  if (data.vanity != "" || data.vanity !== undefined){
  let vanity = await serverModel.findOne({ vanity: data.vanity })
      if (vanity !== null && vanity.id !== BotRaw._id) return res.status(404).render(
          "error.ejs", {
             user,
             code: 404,
             message: "The vanity you chose for this server is in use already!",
          }
      )

}

  await bot.save().then(async () => {
    return res.redirect(
    `/servers/${req.params.id}?success=true&body=You edited this server successfully.`
   );
    let logs = client.channels.get(config.channels.weblogs);
    logs.sendMessage(
      `<\\@${req.session.userAccountId}> edited **${BotRaw.name}**.\n<https://revoltbots.org/servers/${req.params.id}>`
    );
  });
});


router.post("/submit", async (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json("You need to provide the server's information.");
  let user = await userModel.findOne({ id: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  if (await serverModel.findOne({ id: data.serverid })) return res.status(409).render("error.ejs", { user, code: 409, message: "This server has already been added to the list." })
  let serverRaw = await global.sclient.servers.fetch(data.serverid).catch((err) => { console.log(err) });
  if (!serverRaw) return res.status(400).render("error.ejs", { user, code: 400, message: "The provided server couldn't be found on Revolt" })
  if (data.owners) {
    let owners = [];
    owners.push(req.session.userAccountId);
    data.owners.split(" ").forEach((owner) => owners.push(owner));
    data.owners = owners;
  } else {
    data.owners = [];
    data.owners.push(req.session.userAccountId);
  }
  if (data.owners) {
    data.owners.forEach(async (owner) => {
      try {
        await global.sclient.users.get(owner);
      } catch (e) {
        return res.status(409).render(
          "error.ejs", {
          user,
          code: 409,
          message: "One of your owners is not a real user, or isn't in a server with the bot.",
        }
        )
      }
    });
  }
  await serverModel.create({
    id: data.serverid,
    name: serverRaw.name,
    iconURL: `https://autumn.revolt.chat/icons/${serverRaw.icon?._id}`,
    bannerURL: `https://autumn.revolt.chat/banners/${serverRaw.banner?._id}`,
    prefix: data.prefix,
    shortDesc: data.shortDesc,
    banned: false,
    description: data.desc,
    website: data.website || null,
    invite: data.invite || null,
    tags: data.tags,
    owners: data.owners,
    vanity: data?.vanity || null,
    submittedOn: Date.now(),
  })
    .then(async () => {
      res.status(201).json({ message: "Added to list!", code: "OK" });
      let logs = global.sclient.channels.get(config.channels.weblogs);
      logs.sendMessage(
        `<@${req.session.userAccountId}> has submitted **${serverRaw.name}** to the list.\n<https://revoltbots.org/servers/${data.serverid}>`
      );
    });
});
router.get("/:id/vote", async (req, res) => {
  let bot = await serverModel.findOne({ id: req.params.id }) ||
    (await serverModel.findOne({
      vanity: { $regex: `^${req.params.id}$`, $options: "i" },
    }));
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (!bot || bot == null)
    return res.status(409).render(
      "error.ejs", {
      user,
      code: 404,
      message: "This server could not be found on our list."
    });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }

  res.render("servers/vote.ejs", {
    user: user || null,
    bot,
  });
});


router.post("/:id/vote", async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  let bot = await serverModel.findOne({ id: req.params.id });
  if (!bot)
    return res.status(404).render(
      "error.ejs", {
      user,
      code: 404,
      message: "This server could not be found on our list.",
    }
    )
  let x = await voteModel.findOne({
    user: req.session.userAccountId,
    bot: req.params.id,
  });
  if (x) {
    const vote = canUserVote(x);
    if (!vote.status)
      return res.status(202).render(
        "error.ejs", {
        user,
        code: 202,
        message: `Please wait ${vote.formatted} before you can vote again.`,
      }
      )
    await x.remove().catch(() => null);
  }

  const D = Date.now(),
    time = 43200000;
  await voteModel.create({
    bot: req.params.id,
    user: req.session.userAccountId,
    date: D,
    time,
  });
  await serverModel.findOneAndUpdate(
    { id: req.params.id },
    { $inc: { votes: 1, monthlyVotes: 1 } }
  );
  const BotRaw = await client.servers.fetch(bot.id);

  const logs = client.channels.get(config.channels.votelogs);
  if (logs)
    logs
      .sendMessage(
        `<\\@${req.session.userAccountId}> voted for **${BotRaw.name}**.\n<https://revoltbots.org/servers/${BotRaw._id}>`
      )
      .catch(() => null);

  return res.redirect(
    `/servers/${req.params.id}?success=true&body=You voted successfully. You can vote again after 12 hours.`
  );
});

router.post("/:id/review", checkAuth, async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  const botDb = await serverModel.findOne({ id: req.params.id });
  if (!botDb) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: `Server not found.`,
  }
  )

  if (botDb.owner === req.session.userAccountId) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `Server owners cannot review their own Server!`,
  }
  )
  if (botDb.reviews.filter(e => e.type === "review").find((x) => x.revoltId === req.session.userAccountId)) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `You have already reviewed this server!`,
  }
  )


  botDb.reviews.push({
    revoltId: req.session.userAccountId,
    createdAt: Date.now(),
    rating: Number(req.body.rating),
    msg: req.body.review,
    type: "review",
  });

  await botDb.save().then(() => {
    return res.redirect(`/servers/${req.params.id}#${req.session.userAccountId}`);
  })
});

router.post("/:botId/review/:userId/reply", checkAuth, async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  const botDb = await serverModel.findOne({ id: req.params.botId });
  if (!botDb) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: `Server not found.`,
  }
  )

  if (!botDb.owners.includes(req.session.userAccountId)) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `Only server owners can reply to reviews!`,
  }
  )
  if (botDb.reviews.filter(e => e.replied === req.params.userId).filter(e => e.type === "reply").find((x) => x.revoltId === req.session.userAccountId)) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `You have already replied to this review!`,
  }
  )

  botDb.reviews.push({
    replied: req.params.userId,
    revoltId: req.session.userAccountId,
    createdAt: Date.now(),
    rating: Number(req.body.rating),
    msg: req.body.review,
    type: "reply",
  });

  await botDb.save().then(() => {
    return res.redirect(`/servers/${req.params.botId}#${req.params.userId}`);
  })
});

router.post("/:botId/review/:userId/delete", checkAuth, async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }
  const botDb = await serverModel.findOne({ id: req.params.botId });
  if (!botDb) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: `Server not found.`,
  }
  )

  if (!botDb.owners.includes(req.session.userAccountId)) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `Only server owners can reply to reviews!`,
  }
  )
  if (botDb.reviews.filter(e => e.replied === req.params.userId).filter(e => e.type === "reply").find((x) => x.revoltId === req.session.userAccountId)) return res.status(403).render(
    "error.ejs", {
    user,
    code: 403,
    message: `You have already replied to this review!`,
  }
  )

  botDb.reviews.push({
    replied: req.params.userId,
    revoltId: req.session.userAccountId,
    createdAt: Date.now(),
    rating: Number(req.body.rating),
    msg: req.body.review,
    type: "reply",
  });

  await botDb.save().then(() => {
    return res.redirect(`/server/${req.params.botId}#${req.params.userId}`);
  })
});
router.post("/:botId/review/:userId/modal", checkAuth, async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });

  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
    user.id = user.revoltId;
  }

  const botDb = await serverModel.findOne({ id: req.params.botId });
  if (!botDb) return res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: "Server not found.",
  }
  )
  let info = req.body;
  if (!info) return res.status(400).render(
    "error.ejs", {
    user,
    code: 400,
    message: "No info provided.",
  }
  )

  if (info?.method === "ownerDelete") {
    if (info?.type === "review") {
      if (info.id !== info.userId) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You can only delete your own reviews!",
      }
      )

      let reviews = botDb.reviews.filter(e => e.type === "review").filter(e => e.revoltId !== info.id);
      let replies = botDb.reviews.filter(e => e.type === "reply").filter(e => e.replied !== info.id)
      botDb.reviews = [...reviews, ...replies];
      await botDb.save().then(() => {
        return res.redirect(`/servers/${req.params.botId}#reviewStart`);
      });
    } else if (info?.type === "reply") {
      if (!botDb.owners.includes(info.userId)) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You aren't an owner of this server!",
      }
      )

      let reviews = botDb.reviews.filter(e => e.type === "review");
      let replies = botDb.reviews.filter(e => e.type === "reply").filter(e => e.replied !== info.reviewId)
      botDb.reviews = [...reviews, ...replies];
      await botDb.save().then(() => {
        return res.redirect(`/servers/${req.params.botId}#reviewStart`);
      });
    }
  } else if (info?.method === "staffDelete") {
    if (info?.type === "review") {
      const userDb = await userModel.findOne({ revoltId: info.userId });
      if (!userDb.isStaff || !userDb.isAdmin) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You aren't a staff member!",
      }
      )

      let reviews = botDb.reviews.filter(e => e.type === "review").filter(e => e.revoltId !== info.id);
      let replies = botDb.reviews.filter(e => e.type === "reply").filter(e => e.replied !== info.id)
      botDb.reviews = [...reviews, ...replies];
      await botDb.save().then(() => {
        return res.redirect(`/servers/${req.params.botId}#reviewStart`);
      });
    } else if (info?.type === "reply") {
      const userDb = await userModel.findOne({ revoltId: info.userId });
      if (!userDb.isStaff || !userDb.isAdmin) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You aren't a staff member!",
      }
      )

      let reviews = botDb.reviews.filter(e => e.type === "review");
      let replies = botDb.reviews.filter(e => e.type === "reply").filter(e => e.replied !== info.reviewId)
      botDb.reviews = [...reviews, ...replies];
      await botDb.save().then(() => {
        return res.redirect(`/servers/${req.params.botId}#reviewStart`);
      });
    }
  } else if (info?.method === "flagModal") {
    if (info?.type === "review") {
      const reports = await reportModel.find({ serverId: req.params.botId });
      const report = reports.find(e => e.reporterId === info.userId);

      const botDb = await serverModel.findOne({ id: req.params.botId });
      if (!botDb) return res.status(404).render(
        "error.ejs", {
        user,
        code: 404,
        message: "This server was not found on our list.",
      }
      )
      let user = await userModel.findOne({ id: req.session.userAccountId });
      if (user) {
        let userRaw = await client.users.fetch(user.revoltId);
        user.username = userRaw.username;
        user.avatar = userRaw.avatar;
      }
      if (report?.userId === info.id) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You have already reported this review!",
      }
      )

      await reportModel.create({
        serverId: info.botId,
        url: info.url,
        userId: info.id,
        reporterId: info.userId,
        description: info.msg,
        reason: info.review,
        type: "review",
        active: true,
      })

      let logs = client.channels.get(config.channels.reportlogs);
      if (logs)
        logs.sendMessage(`<\\@${info.userId}> reported a review on **${botDb.name}**.\n<https://revoltbots.org/servers/${botDb.id}>`).catch(() => null);
      return res.redirect(`/servers/${info.botId}?success=true&body=This review is reported#${info.id}`);
    } else if (info?.type === "reply") {
      const reports = await reportModel.find({ serverId: req.params.botId });
      const report = reports.find(e => e.reporterId === info.userId);
      let user = await userModel.findOne({ id: req.session.userAccountId });
      if (user) {
        let userRaw = await client.users.fetch(user.revoltId);
        user.username = userRaw.username;
        user.avatar = userRaw.avatar;
      }
      if (report?.userId === info.id) return res.status(403).render(
        "error.ejs", {
        user,
        code: 403,
        message: "You have already reported this review!",
      }
      )

      const botDb = await serverModel.findOne({ id: req.params.botId });
      if (!botDb) return res.status(404).render(
        "error.ejs", {
        user,
        code: 404,
        message: "This server was not found on our list.",
      }
      )

      await reportModel.create({
        serverId: info.botId,
        url: info.url,
        userId: info.id,
        reporterId: info.userId,
        description: info.msg,
        reason: info.review,
        type: "reply",
        active: true
      })

      let logs = client.channels.get(config.channels.reportlogs);
      if (logs)
        logs
          .sendMessage(
            `<\\@${info.userId}> reported a reply on **${botDb.name}**.\n<https://revoltbots.org/panel/reports#active_${info.userId}>`
          )
          .catch(() => null);
      return res.redirect(`/servers/${info.botId}?success=true&body=This reply is reported#reply-${info.id}`);
    }
  }
});
function checkAuth(req, res, next) {
  if (req.session.userAccountId) {
    userModel.findOne(
      { revoltId: req.session.userAccountId },
      (error, userAccount) => {
        if (error) {
          res.status(500).send(error);
        } else if (userAccount) {
          next();
        } else {
          res.redirect("/login");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
function canUserVote(x) {
  const left = x.time - (Date.now() - x.date),
    formatted = ms(left, { long: true });
  if (left <= 0 || formatted.includes("-")) return { status: true };
  return { status: false, left, formatted };
}
