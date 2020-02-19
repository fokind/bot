"use strict";

require("dotenv").config();
 
const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();
require("express-ws")(app);

const port = process.env.PORT;
app.use(express.static("./webapp"));

app.use("/odata", BotServer.create());

app.ws("/ws", ws => {
    setInterval(() => {
        ws.send("test");
    }, 1000);
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
