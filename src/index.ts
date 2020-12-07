import * as dotenv from "dotenv";
import * as express from "express";
import { join } from "path";
import backtests from "./routes/backtests";
import candleImports from "./routes/candleImports";
import idealBacktests from "./routes/idealBacktests";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();
const api = express();

// app.use(
//     "/resources/openui5/financial/chart",
//     express.static(
//         "../node_modules/openui5-financial-charts/dist/resources/openui5/financial/chart",
//     ),
// );

app.use("/", express.static(join(__dirname, "../client/webapp/")));
api.use("/backtests", backtests);
api.use("/candleImports", candleImports);
api.use("/idealBacktests", idealBacktests);
app.use("/api", api);

app.listen(port, () =>
    console.log(`server started at http://localhost:${port}`),
);
