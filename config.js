const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, '.env') });

module.exports = {
  port: 9009 ||4891,
  mongoURI: process.env.mongoURI,
  sessionSecret: process.env.sessionSecret,
  ownerids: ["01FEYFD1WH6YXSD0EHVNFW6VSB"],
  clients: {
    manager: {
      prefix: "rbl!",
      token: process.env.managerToken,
    },
    servers: {
      prefix: "rsl!",
      token: process.env.serversToken
    }
  },
  selfbot: {
    email: process.env.selfBotEmail,
    password: process.env.selfBotPassword,
    token: process.env.selfBotToken
  },
  tags: {
    bots: [
      "Anime",
      "Bridge",
      "Multipurpose",
      "Moderation",
      "Giveaways",
      "Music",
      "Fun",
      "Chatbot",
      "Polls",
      "Counting",
      "Logging",
      "Game",
      "NSFW",
    ],
    servers: [
      'Community',
      'Development',
      'Social',
      'Gaming',
      'Emotes',
      'Streaming',
      'Anime',
      'Fun',
      'Roleplay',
      'Giveaway',
      "NSFW"
    ]
  },
  channels: {
    statusLogs: "01HXZCBGHBRY68JZTWB2DJE3HB",
    errorLogs: "01HXZCBGHBRY68JZTWB2DJE3HB",
    weblogs: "01GQ1AKANW8TVTH6R2P79069K8",
    votelogs: "01GXCM24QX3WZP1GBNFQEHSHME",
    reportlogs: "01H1TSKW4XE35HNJAB3W8NM65D",
  },
  servers: {
    main: "01GQ14WC58C8AXCWNJQBFDZNT3",
    testing: "01HJWT1QZYN9GNWTD0BH8YEZBG",
  },
  roles: {
    femboy: "01G5DNNE0QR1ED8Q1E2BZ5Y3AT",
    bots: "01GX2QPE8SWZWPVN3DFQGJCMHC",
    botsintesting: "01H0E1JT1C8TMAPNDJ15SCTA6W",
    developers: "01GZS6GRA53KVMDB4XY38MRMAE",
    members: "01GVC849ZNZYCC9BFYHNJSNNBB",
    staff: "01GX1RXVPQV3TNCTXS109H50DW",
    reviewer: "01GZJ7Y5NFNB5JRHXYZWNGWZZZ",
    contributor: "01GZJ7Y5NFNB5JRHXYZWNGWZZZ",
    partner: "01H1DJ15N9N21RY3AH9XFPQYB9",
    certified: "01H1MG7T9CHX41XE36911GCT31",
    botCertified: "01H1MG7YA13EC3M0R4EGKRKXBD"
  },
};
