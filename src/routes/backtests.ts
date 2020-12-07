import * as express from "express";
import { IBacktest } from "../interfaces/IBacktest";
import { BacktestService } from "../services/BacktestService";

const router = express.Router();

router.get("/", async (req, res) => {
    const idealBacktests: IBacktest[] = (
        await BacktestService.findAll()
    ).map((e) => Object.assign(e, { _id: e._id.toHexString() }));
    res.json(idealBacktests);
});

router.get("/:backtestId", async (req, res) => {
    const { backtestId } = req.params;
    const backtest: IBacktest = await BacktestService.findOne(backtestId);
    res.json(Object.assign(backtest, { _id: backtest._id.toHexString() }));
});

export default router;
