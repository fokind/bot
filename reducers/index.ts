import { combineReducers } from "redux";
import axios from "axios";
import { CREATE_STRATEGY, SET_BUY, SET_SELL } from "../actions";
import { IStrategy } from "../interfaces/IStrategy";

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

const app = combineReducers({
    strategy,
});

export default app;
