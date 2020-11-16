import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BacktestsModule } from "./backtests/backtests.module";

@Module({
    imports: [BacktestsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
