"use strict";

require("dotenv").config();

const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();
require("express-ws")(app);

const port = process.env.PORT;
app.use(express.static("./webapp"));
app.use("/odata", BotServer.create());

const botServer = new BotServer();
const eventBus = BotServer.getEventBus();

app.ws("/ws", ws => {
  eventBus.on("ticker", e => {
    ws.send(JSON.stringify({
        name: "ticker",
        data: e
    })); // проверить, что клиент доступен
  });

  botServer.start();
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
