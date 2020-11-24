import { NextApiRequest, NextApiResponse } from "next";
import { CandleImportService } from "../../../services/CandleImportService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const items = await CandleImportService.findAll();
            res.json(items);
            res.statusCode = 200;
            break;

        case "POST":
            const item = await CandleImportService.create(req.body);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
