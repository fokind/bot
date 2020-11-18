import { NextApiRequest, NextApiResponse } from "next";
import { BacktestService } from "../../../server/services/BacktestService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const item = await BacktestService.findOne(req.query.id as string);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
