import { NextApiRequest, NextApiResponse } from "next";
import { IdealBacktestService } from "../../../server/services/IdealBacktestService";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const items = await IdealBacktestService.findAll();
            res.json(items);
            res.statusCode = 200;
            break;

        case "POST":
            const item = await IdealBacktestService.create(req.body);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
