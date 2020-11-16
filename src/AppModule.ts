import { Module } from "@nestjs/common";
import { BacktestModule } from "./modules/BacktestModule";
import { IdealBacktestModule } from "./modules/IdealBacktestModule";
import { CandleImportModule } from "./modules/CandleImportModule";

@Module({
    imports: [BacktestModule, IdealBacktestModule, CandleImportModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
