const express = require("express");
const path = require("node:path");
const mongoose = require("mongoose");
const fs = require("node:fs");
const CleanCSS = require("clean-css");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo")(session);

//-Webserver-//
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/pages"));
app.disable("x-powered-by");
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(express.static(__dirname + "/static"));
app.get("/login", async function (req, res) {
  let userModel = require("../database/models/user");
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  res.render("auth/login.ejs", { user: user || null });
});

app.post("/login", async (req, res) => {
  let requestModel = require("../database/models/loginRequest");
  try {
    if (!req.body)
      return res.json({
        error: 400,
        message: "Please provide the Revolt Id to login.",
      });

   let userModel = require("../database/models/user");
    const us = await userModel.findOne({revoltId: req.body.revoltID })
    const userRaw = await client.users.fetch(req.body.revoltID);
    if (userRaw.flags == 1 || userRaw.flags == 2 || us && us.isBanned == true){
          if (!us.isBanned && userRaw.flags == 1 || !us.isBanned && user.flags == 2){
		us.isBanned = true
		us.save()
          }
          return res.status(403).send({error: "This revolt account has been suspended/banned."});
    }
    if (await requestModel.findOne({ revoltId: req.body.revoltID }))
      return res.json({
        error: 400,
        message: "There is already an on-going login request for this account.",
      });
    let code = generateLoginCode();
    let request = await requestModel.create({
      revoltId: req.body.revoltID,
      verified: false,
      code: code,
    });
    res.render("auth/confirm.ejs", {
      code,
      revoltId: req.body.revoltID,
      user: null,
    });
  } catch (err) {
    res.json({ error: 500, message: "Internal Server Error" });
  }
});

app.post("/login/confirm", async (req, res) => {
  let model = require("../database/models/user");
  let requestModel = require("../database/models/loginRequest");

  try {
    let request = await requestModel.findOne({
      verified: true,
      revoltId: req.body.revoltId,
    });
    if (!request)
      return res.redirect(
        "/login?message=I could not find a login request with that Revolt Id that was confirmed."
      );

    await request.delete();
    if (!(await model.findOne({ revoltId: req.body.revoltId }))) {
      const userAccount = await model.create({
        revoltId: req.body.revoltId,
        verified: true,
        createdAt: Date.now(),
      });
	const flags = await client.users.fetch(req.body.revoltId).flags
      userAccount.save(async(error) => {
        if (error) {
          res.status(500).send(error);
        } else if (flags != null && flags == 1 || flags != null && flags == 2){
          res.status(403).send({error: "This revolt account has been suspended/banned."});
	  } else {
          req.session.userAccountId = userAccount.revoltId;
          res.redirect("/?message=Logged In Successfully.");
        }
      });
    } else {
      req.session.userAccountId = req.body.revoltId;
      res.redirect("/?message=Logged In Successfully.");
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: 500, message: "Internal Server Error" });
  }
});

app.get("/session", checkAuth, async (req, res) => {
  let model = require("../database/models/user.js");
  const data = await model.findOne({ revoltId: req.session.userAccountId });
  res.json({
    revoltId: data.revoltId,
    createdAt: data.createdAt,
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.redirect("/?message="+( req.query.message ||"" ));
    }
  });
});

app.get("/server", (req, res) => res.redirect("https://rvlt.gg/eRWNx4wh"));

app.get("/downloads", async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  if (user) {
    let userRaw = await client.users.fetch(user.revoltId);
    user.username = userRaw.username;
    user.avatar = userRaw.avatar;
  }
  res.render("downloads", { user });
});

//-Routers-//
const indexRouter = require("./routes/index.js");
const panelRouter = require("./routes/panel.js");
const apiRouter = require("./routes/api.js");
const botsRouter = require("./routes/bots.js");
const serversRouter = require("./routes/servers.js");
const usersRouter = require("./routes/users.js");
const botRulesRouter = require("./routes/bot-rules.js");
const discordRouter = require("./routes/revurn.js");
const docsRouter = require("./routes/docs.js")
const teamRouter = require("./routes/team.js")
const partnersRouter = require("./routes/partners.js")
app.use("/", checkBanned, indexRouter);
app.use("/panel", checkBanned, checkAuth, checkStaff, panelRouter);
app.use("/api", checkBanned, apiRouter);
app.use("/bots", checkBanned, botsRouter);
app.use("/bot", checkBanned, botsRouter);
app.use("/servers", checkBanned, serversRouter);
app.use("/server", checkAuth, checkBeta, serversRouter);
app.use("/users", checkBanned, usersRouter);
app.use("/user", checkBanned, usersRouter);
app.use("/bot-rules", checkBanned, botRulesRouter);
app.use("/docs", checkBanned, docsRouter)
app.use("/team", checkBanned, teamRouter)
app.use("/partners", checkBanned, partnersRouter)
app.listen(config.port, () => {
  console.info(`[INFO] Running on port ` + config.port);
});
app.use("*", async (req, res) => {
  let user = await userModel.findOne({ revoltId: req.session.userAccountId });
  res.status(404).render(
    "error.ejs", {
    user,
    code: 404,
    message: "It looks like you found a (404)",
  })
})

async function checkAuth(req, res, next) {
  if (req.session.userAccountId) {
    let model = require("../database/models/user.js");
    model.findOne(
      { revoltId: req.session.userAccountId },
      async (error, userAccount) => {
        if (error) {
          res.status(500).send(error);
        } else if (userAccount) {
	   if(userAccount.isBanned == true){
	     res.redirect("/logout?message=The%20Account%20you%20logged%20in%20with%20has%20been%20banned!");
	   }else{
          next();
          }
       } else {
          res.redirect("/login");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
}
async function checkBanned(req, res, next) {
  if (req.session.userAccountId) {
    let model = require("../database/models/user.js");
    model.findOne(
      { revoltId: req.session.userAccountId },
      async (error, userAccount) => {
        if (error) {
          res.status(500).send(error);
        } else if (userAccount) {
	   if(userAccount.isBanned == true){
	     res.redirect("/logout?message=The%20Account%20you%20logged%20in%20with%20has%20been%20banned!");
	   } else{
            return next();
            }
       } else {
            return next();
        }
      }
    );
  } else {
	return next();
  }
}

function checkStaff(req, res, next) {
  if (req.session.userAccountId) {
    let model = require("../database/models/user.js");
    model.findOne(
      { revoltId: req.session.userAccountId },
      (error, userAccount) => {
        if (error) {
          res.status(500).send(error);
        } else if (userAccount) {
          if (userAccount.isStaff) {
            next();
          } else {
            let user = userAccount;
            if (user) {
              let userRaw = client.users.fetch(user.revoltId);
              user.username = userRaw.username;
              user.avatar = userRaw.avatar;
            }
            res.status(403).render(
              "error.ejs", {
              user,
              code: 403,
              message: "You are not authorized to view this page at this time.",
            }
            )
          }
        } else {
          res.redirect("/login");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
}

function checkBeta(req, res, next) {
  if (req.session.userAccountId) {
    let model = require("../database/models/user.js");
    model.findOne(
      { revoltId: req.session.userAccountId },
      (error, userAccount) => {
        if (error) {
          res.status(500).send(error);
        } else if (userAccount) {
          if (userAccount.betaTester) {
            next();
          } else {
            let user = userAccount;
            if (user) {
              let userRaw = client.users.fetch(user.revoltId);
              user.username = userRaw.username;
              user.avatar = userRaw.avatar;
            }
            res.status(403).render(
              "error.ejs", {
              user,
              code: 403,
              message: "You are not authorized to view this page at this time.",
            }
            )
          }
        } else {
          res.redirect("/login");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
}

function generateLoginCode() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 5; i++) {
    const index = Math.floor(Math.random() * code.length);
    code =
      code.slice(0, index) +
      code.charAt(index).toUpperCase() +
      code.slice(index + 1);
  }
  return code;
}
