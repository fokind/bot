import { Controller, Get, Param } from "@nestjs/common";
import { BacktestsService } from "./backtests.service";
import { IBacktest } from "./interfaces/backtest.interface";

@Controller("backtests")
export class BacktestsController {
    constructor(private readonly backtestsService: BacktestsService) {}

    @Get()
    async findAll(): Promise<IBacktest[]> {
        return this.backtestsService.getBacktests();
    }

    @Get(":id")
    async finOne(@Param() params): Promise<IBacktest> {
        return this.backtestsService.getBacktest(params.id);
    }
}
