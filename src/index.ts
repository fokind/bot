import * as dotenv from "dotenv";
import * as express from "express";
import * as bodyParser from "body-parser";
import { join } from "path";
import backtests from "./routes/backtests";
import candleImports from "./routes/candleImports";
import idealBacktests from "./routes/idealBacktests";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();
const api = express();

const jsonParser = bodyParser.json();

app.use("/", express.static(join(__dirname, "../client/webapp/")));

// на время разработки:
app.use(
    "/resources/openui5/financial/chart/themes",
    express.static(
        join(
            __dirname,
            "../../openui5-financial-charts/dist/resources/openui5/financial/chart/themes",
        ),
    ),
);

app.use(
    "/resources/openui5/financial/chart",
    express.static(
        join(
            __dirname,
            "../../openui5-financial-charts/src/openui5/financial/chart",
        ),
    ),
);
//

api.use("/backtests", jsonParser, backtests);
api.use("/candleImports", candleImports);
api.use("/idealBacktests", idealBacktests);

app.use("/api", api);

app.listen(port, () =>
    console.log(`server started at http://localhost:${port}`),
);
