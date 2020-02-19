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
const eventEmitter = BotServer.eventEmitter;

app.ws("/ws", ws => {
  // по подписке на событие новых данных выдавать новые данные на фронт
  eventEmitter.on("time", e => {
    ws.send(e); // проверить, что клиент доступен
  });

  botServer.start(); // выполнять по какой-то команде с фронта
  // команда может приходить непосредствено на сервер или через ws
  // т.к. и odata и ws это один и тот же сервер с разными интерфейсами доступа, то не должно иметь значения что за команда
  // ws просто обрабатывает события и передает их клиенту, не более и наоборот
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
