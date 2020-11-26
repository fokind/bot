import "../styles/global.css";
import { AppProps } from "next/app";
import { Provider } from "react-redux";
import { createStore } from "redux";
import app from "../reducers";

const store = createStore(app);
const unsubscribe = store.subscribe(() => console.log(store.getState()));

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    );
}
