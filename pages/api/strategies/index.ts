import { NextApiRequest, NextApiResponse } from "next";
import { StrategyService } from "../../../services/StrategyService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const items = await StrategyService.findAll();
            res.json(items);
            res.statusCode = 200;
            break;

        case "POST":
            const item = await StrategyService.create(req.body);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
