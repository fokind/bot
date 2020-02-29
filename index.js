"use strict";

require("dotenv").config();

const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();
require("express-ws")(app);

const port = process.env.PORT;
app.use(express.static("./webapp"));
app.use("/odata", BotServer.create());

const eventBus = BotServer.eventBus;

app.ws("/ws", ws => {
  eventBus.on("ticker", e => {
    try {
      ws.send(
        JSON.stringify({
          name: "ticker",
          data: e
        })
      ); // проверить, что клиент доступен
    } catch (error) {
      console.log(error);
    }
  });
  eventBus.on("candle", e => {
    try {
      ws.send(
        JSON.stringify({
          name: "candle",
          data: e
        })
      );
    } catch (error) {
      console.log(error);
    }
  });
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
