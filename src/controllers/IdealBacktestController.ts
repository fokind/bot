import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IdealBacktestService } from "../services/IdealBacktestService";
import { CreateIdealBacktestDto } from "../dto/CreateIdealBacktestDto";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

@Controller("idealbacktests")
export class IdealBacktestController {
    constructor(private readonly backtestService: IdealBacktestService) {}

    @Get()
    async findAll(): Promise<IIdealBacktest[]> {
        return this.backtestService.findAll();
    }

    @Get(":id")
    async findOne(@Param() params): Promise<IIdealBacktest> {
        return this.backtestService.findOne(params.id);
    }

    @Post()
    async create(
        @Body() body: CreateIdealBacktestDto,
    ): Promise<IIdealBacktest> {
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
