import { GetStaticProps } from "next";
import { List } from "fundamental-react";
import { BacktestService } from "../../server/services/BacktestService";

export default function Backtest({ backtest }) {
    return (
        <List>
            <List.Item>
                <List.Text>{backtest._id}</List.Text>
            </List.Item>
            <List.Item>
                <List.Text>{backtest.begin}</List.Text>
            </List.Item>
            <List.Item>
                <List.Text>{backtest.end}</List.Text>
            </List.Item>
        </List>
    );
}

export async function getStaticPaths() {
    const paths = (await BacktestService.findAllIds()).map((e) => ({
        params: {
            id: e,
        },
    }));

    return {
        paths,
        fallback: false,
    };
}

export const getStaticProps: GetStaticProps = async ({
    params,
}: {
    params: {
        id: string;
    };
}) => {
    const backtest = await BacktestService.findOne(params.id);

    return {
        props: {
            backtest,
        },
    };
};
