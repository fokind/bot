import { NextApiRequest, NextApiResponse } from "next";
import { IdealBacktestService } from "../../../services/IdealBacktestService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const item = await IdealBacktestService.findOne(req.query.id as string);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
