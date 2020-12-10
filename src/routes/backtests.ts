import * as express from "express";
import { ICandle } from "../interfaces/ICandle";
import { IBacktest } from "../interfaces/IBacktest";
import { BacktestService } from "../services/BacktestService";

const router = express.Router();

router.get("/", async (req, res) => {
    const backtests: IBacktest[] = await BacktestService.findAll();
    res.json(backtests);
    res.statusCode = 200;
});

router.post("/", async (req, res) => {
    const backtest: IBacktest = await BacktestService.create(req.body);
    res.json(backtest);
    res.statusCode = 200;
});

router.get("/:backtestId", async (req, res) => {
    const { backtestId } = req.params;
    const backtest: IBacktest = await BacktestService.findOne(backtestId);
    res.json(backtest);
    res.statusCode = 200;
});

router.get("/:backtestId/candles", async (req, res) => {
    const { backtestId } = req.params;
    const candles: ICandle[] = await BacktestService.findCandles(backtestId);
    res.json(candles);
    res.statusCode = 200;
});

export default router;
