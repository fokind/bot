import { IsNotEmpty } from "class-validator";

export class CreateCandleImportDto {
    @IsNotEmpty()
    readonly exchange: string;

    @IsNotEmpty()
    readonly currency: string;

    @IsNotEmpty()
    readonly asset: string;

    @IsNotEmpty()
    readonly period: number;

    @IsNotEmpty()
    readonly begin: string;

    @IsNotEmpty()
    readonly end: string;
}
