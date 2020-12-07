export const CREATE_STRATEGY = "CREATE_STRATEGY";
export const SET_BUY = "SET_BUY";
export const SET_SELL = "SET_SELL";
export const SET_STRATEGY_CODE = "SET_STRATEGY_CODE";
export const CREATE_BACKTEST = "CREATE_BACKTEST";

export function createStrategy() {
    return { type: CREATE_STRATEGY };
}

export function setBuy(buy: string): { type: string; data: string } {
    return { type: SET_BUY, data: buy };
}

export function setSell(sell: string): { type: string; data: string } {
    return { type: SET_SELL, data: sell };
}

export function setStrategyCode(strategyCode: string): { type: string; data: string } {
    return { type: SET_SELL, data: strategyCode };
}

export function createBacktest() {
    return { type: CREATE_BACKTEST };
}
