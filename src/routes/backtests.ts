import * as express from "express";
import { ICandle } from "../interfaces/ICandle";
import { IBacktest } from "../interfaces/IBacktest";
import { BacktestService } from "../services/BacktestService";

const router = express.Router();

router.get("/", async (req, res) => {
    const idealBacktests: IBacktest[] = await BacktestService.findAll();
    res.json(idealBacktests);
});

router.get("/:backtestId", async (req, res) => {
    const { backtestId } = req.params;
    const backtest: IBacktest = await BacktestService.findOne(backtestId);
    res.json(backtest);
});

router.get("/:backtestId/candles", async (req, res) => {
    const { backtestId } = req.params;
    const candles: ICandle[] = await BacktestService.findCandles(backtestId);
    res.json(candles);
});

export default router;
