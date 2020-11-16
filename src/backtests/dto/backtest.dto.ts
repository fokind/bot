import { IsNotEmpty } from "class-validator";

export class BacktestDto {
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
    readonly strategyName: string;

    @IsNotEmpty()
    readonly strategyWarmup: number;

    @IsNotEmpty()
    readonly strategyCode: string;

    @IsNotEmpty()
    readonly strategyIndicatorInputs: string;

    @IsNotEmpty()
    readonly stoplossLevel: number;

    @IsNotEmpty()
    readonly fee: number;

    @IsNotEmpty()
    readonly initialBalance: number;
}
