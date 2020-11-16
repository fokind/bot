import { Module } from "@nestjs/common";
import { BacktestsController } from "./backtests.controller";
import { BacktestsService } from "./backtests.service";

@Module({
    imports: [],
    controllers: [BacktestsController],
    providers: [BacktestsService],
})
export class BacktestsModule {}
