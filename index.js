"use strict";

require("dotenv").config();

const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();

const port = process.env.PORT;
app.use(express.static("./static/webapp"));
app.use("/odata", BotServer.create());

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
