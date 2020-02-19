"use strict";

require("dotenv").config();

const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();
require("express-ws")(app);

const port = process.env.PORT;
app.use(express.static("./webapp"));
const botServer = new BotServer();
app.use("/odata", BotServer.create());

app.ws("/ws", ws => {
  // по подписке на событие новых данных выдавать новые данные на фронт
  botServer.on("time", e => {
    ws.send(e);
  });

  botServer.start();
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
