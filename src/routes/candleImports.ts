import * as express from "express";
import { ICandleImport } from "../interfaces/ICandleImport";
import { CandleImportService } from "../services/CandleImportService";

const router = express.Router();

router.get("/", async (req, res) => {
    const candleImports: ICandleImport[] = (
        await CandleImportService.findAll()
    ).map((e) => Object.assign(e, { _id: e._id.toHexString() }));
    res.json(candleImports);
});

router.get("/:candleImportId", async (req, res) => {
    const { candleImportId } = req.params;
    const candleImport: ICandleImport = await CandleImportService.findOne(
        candleImportId,
    );
    res.json(
        Object.assign(candleImport, { _id: candleImport._id.toHexString() }),
    );
});

export default router;
