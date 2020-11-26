import { NextApiRequest, NextApiResponse } from "next";
import { StrategyService } from "../../../services/StrategyService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const item = await StrategyService.findOne(req.query.id as string);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
