import { NextApiRequest, NextApiResponse } from "next";
import { CandleImportService } from "../../../services/CandleImportService"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET":
            const item = await CandleImportService.findOne(req.query.id as string);
            res.json(item);
            res.statusCode = 200;
            break;
    }
};
