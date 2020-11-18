import { NextApiRequest, NextApiResponse } from "next";
import { BacktestService } from "../../../server/services/BacktestService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const items = await BacktestService.findAll();
            res.json(items);
            res.statusCode = 200;
            break;

        case "POST":
            const item = await BacktestService.create(req.body);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
