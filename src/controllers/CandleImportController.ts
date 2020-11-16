import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CandleImportService } from "../services/CandleImportService";
import { CreateCandleImportDto } from "../dto/CreateCandleImportDto";
import { ICandleImport } from "../interfaces/ICandleImport";

@Controller("candleImports")
export class CandleImportController {
    constructor(private readonly candleImportService: CandleImportService) {}

    @Get()
    async findAll(): Promise<ICandleImport[]> {
        return this.candleImportService.findAll();
    }

    @Get(":id")
    async findOne(@Param() params): Promise<ICandleImport> {
        return this.candleImportService.findOne(params.id);
    }

    @Post()
    async create(@Body() body: CreateCandleImportDto): Promise<ICandleImport> {
        return this.candleImportService.create(body);
    }
}
