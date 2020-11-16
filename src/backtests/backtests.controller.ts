import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { BacktestsService } from "./backtests.service";
import { CreateBacktestDto } from "./dto/backtest.dto";
import { IBacktest } from "./interfaces/backtest.interface";

@Controller("backtests")
export class BacktestsController {
    constructor(private readonly backtestsService: BacktestsService) {}

    @Get()
    async findAll(): Promise<IBacktest[]> {
        return this.backtestsService.findAll();
    }

    @Get(":id")
    async finOne(@Param() params): Promise<IBacktest> {
        return this.backtestsService.finOne(params.id);
    }

    @Post()
    async create(@Body() body: CreateBacktestDto): Promise<IBacktest> {
        return this.backtestsService.create(body);
    }
}
