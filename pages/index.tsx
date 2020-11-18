import { GetStaticProps } from "next";
import { List } from "fundamental-react";

export default function Backtests({ backtests }) {
    return (
        <List>
            {backtests.map((e, i) => (
                <List.Item key={i}>
                    <List.Text>{e._id}</List.Text>
                </List.Item>
            ))}
        </List>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const res = await fetch("http://localhost:3000/api/backtests");
    const backtests = await res.json();

    return {
        props: {
            backtests,
        },
    };
};
