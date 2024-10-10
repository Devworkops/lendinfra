import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord} from "../../models/data-record";
import {logActivity} from "../../helper/log";
// import { Datamodel } from "../../models/data-model"

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/datarecord/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
    const datarecord= await DataRecord.findById(req.params.id)
    if (!datarecord) {
        await logActivity(company_id, user_id, "DataRecord", "DataRecord doesn't exists.");
      throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "DataRecord", "ID: " + req.params.id);

    await logActivity(company_id, user_id, "DataRecord", datarecord.toString());
    res.send(datarecord);
  }
);

export { router as showDataRecordDetailRouter };
