import { Module } from "@nestjs/common";
import { CandleImportController } from "../controllers/CandleImportController";
import { CandleImportService } from "../services/CandleImportService";

@Module({
    imports: [],
    controllers: [CandleImportController],
    providers: [CandleImportService],
})
export class CandleImportModule {}
