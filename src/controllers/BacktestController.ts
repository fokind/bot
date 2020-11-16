import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { BacktestService } from "../services/BacktestService";
import { CreateBacktestDto } from "../dto/CreateBacktestDto";
import { IBacktest } from "../interfaces/IBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

@Controller("backtests")
export class BacktestController {
    constructor(private readonly backtestService: BacktestService) {}

    @Get()
    async findAll(): Promise<IBacktest[]> {
        return this.backtestService.findAll();
    }

    @Get(":id")
    async findOne(@Param() params): Promise<IBacktest> {
        return this.backtestService.findOne(params.id);
    }

    @Post()
    async create(@Body() body: CreateBacktestDto): Promise<IBacktest> {
        return this.backtestService.create(body);
    }

    @Get(":id/candles")
    async findCandles(@Param() params): Promise<ICandle[]> {
        return this.backtestService.findCandles(params.id);
    }

    @Get(":id/roundtrips")
    async findRoundtrips(@Param() params): Promise<IRoundtrip[]> {
        return this.backtestService.findRoundtrips(params.id);
    }

    @Get(":id/balance")
    async findBalance(@Param() params): Promise<IBalanceItem[]> {
        return this.backtestService.findBalance(params.id);
    }
}
