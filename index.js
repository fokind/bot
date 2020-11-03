"use strict";

require("dotenv").config();

const express = require("express");
const { BotServer } = require("./lib/server");

const app = express();

const port = process.env.PORT;
app.use(express.static("./static/webapp"));

// только на время теста
// app.use("/resources/openui5/financial/chart/themes", express.static("../openui5-financial-charts/dist/resources/openui5/financial/chart/themes"));
// app.use("/resources/openui5/financial/chart", express.static("../openui5-financial-charts/src/openui5/financial/chart"));
app.use(
    "/resources/openui5/financial/chart",
    express.static(
        "./node_modules/openui5-financial-charts/dist/resources/openui5/financial/chart"
    )
);

app.use("/odata", BotServer.create());

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
