import { IStrategy } from "../interfaces/IStrategy";

/*
 * типы экшенов
 */
export const CREATE_STRATEGY = "CREATE_STRATEGY";
export const SET_BUY = "SET_BUY";
export const SET_SELL = "SET_SELL";

/*
 * генераторы экшенов
 */
export function createStrategy() {
    return { type: CREATE_STRATEGY };
}

export function setBuy(buy: string): { type: string; data: string } {
    return { type: SET_BUY, data: buy };
}

export function setSell(sell: string): { type: string; data: string } {
    return { type: SET_SELL, data: sell };
}
