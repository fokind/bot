import { combineReducers } from "redux";
import axios from "axios";
import { CREATE_BACKTEST, CREATE_STRATEGY, SET_BUY, SET_SELL, SET_STRATEGY_CODE } from "../actions";
import { IStrategy } from "../interfaces/IStrategy";
import { IBacktest } from "../interfaces/IBacktest";

function strategy(
    state: IStrategy = {
        warmup: 0,
        buy: "",
        sell: "",
    },
    action: { type: string; data: any },
): IStrategy {
    switch (action.type) {
        case CREATE_STRATEGY:
            const strategy: IStrategy = state;
            axios
                .post(`${window.location.origin}/api/strategies`, strategy)
                .then((response) => console.log(response.data));
            return state;
        case SET_BUY:
            return Object.assign({}, state, {
                buy: action.data as string,
            });
        case SET_SELL:
            return Object.assign({}, state, {
                sell: action.data as string,
            });
        default:
            return state;
    }
}

function backtest(
    state: IBacktest = {
        exchange: "hitbtc",
        currency: "BTC",
        asset: "OMG",
        period: 60,
        begin: "2020-10-01T00:00:00.000Z",
        end: "2020-10-31T23:59:59.999Z",
        strategyName: "1",
        strategyCode: 'return ""; // side: buy|sell',
        strategyIndicatorInputs: "",
        stoplossLevel: 0,
        fee: 0.001,
        initialBalance: 1,
    },
    action: { type: string; data: any },
): IBacktest {
    switch (action.type) {
        case CREATE_BACKTEST:
            const backtest: IBacktest = state;
            axios
                .post(`${window.location.origin}/api/backtests`, backtest)
                .then((response) => console.log(response.data));
            return state;
        case SET_STRATEGY_CODE:
            return Object.assign({}, state, {
                strategyCode: action.data as string,
            });
        default:
            return state;
    }
}

const app = combineReducers({
    strategy,
    backtest,
});

export default app;
