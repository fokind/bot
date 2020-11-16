import { IsNotEmpty } from "class-validator";

export class CreateIdealBacktestDto {
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

    @IsNotEmpty()
    readonly fee: number;

    @IsNotEmpty()
    readonly initialBalance: number;
}
