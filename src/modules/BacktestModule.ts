import { Module } from "@nestjs/common";
import { BacktestController } from "../controllers/BacktestController";
import { BacktestService } from "../services/BacktestService";

@Module({
    imports: [],
    controllers: [BacktestController],
    providers: [BacktestService],
})
export class BacktestModule {}
