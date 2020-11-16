import { Module } from "@nestjs/common";
import { IdealBacktestController } from "../controllers/IdealBacktestController";
import { IdealBacktestService } from "../services/IdealBacktestService";

@Module({
    imports: [],
    controllers: [IdealBacktestController],
    providers: [IdealBacktestService],
})
export class IdealBacktestModule {}
