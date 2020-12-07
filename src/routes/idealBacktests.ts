import * as express from "express";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";
import { IdealBacktestService } from "../services/IdealBacktestService";

const router = express.Router();

router.get("/", async (req, res) => {
    const idealBacktests: IIdealBacktest[] = (
        await IdealBacktestService.findAll()
    ).map((e) => Object.assign(e, { _id: e._id.toHexString() }));
    res.json(idealBacktests);
});

router.get("/:backtestId", async (req, res) => {
    const { backtestId } = req.params;
    const idealBacktest: IIdealBacktest = await IdealBacktestService.findOne(
        backtestId,
    );
    res.json(
        Object.assign(idealBacktest, { _id: idealBacktest._id.toHexString() }),
    );
});

export default router;
