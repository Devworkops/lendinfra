import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";
import { logActivity } from "../../helper/log";

const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/datarecord/object/all/:objectName?",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    const companyId = req?.currentUser?.companyId;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    const { objectName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
       res.status(400).send({ errors: [{ message: 'Invalid page or limit parameter' }] });
    }

    const records = await DataRecord.find({ company: companyId, objectName, isActive: true })
      .sort({createdAt: -1})
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalRecords = await DataRecord.countDocuments({ company: companyId, objectName, isActive: true });

    await logActivity(company_id, user_id, "DataModel", `DataModel fetched successfully. Records: ${records.length}`);

    res.send({
      records,
      total: totalRecords,
      page: pageNumber,
      limit: limitNumber,
    });
  }
);

export { router as allDataRecordsWithoutPaginationRouter };
