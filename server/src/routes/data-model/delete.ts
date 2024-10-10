import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Datamodel } from "../../models/data-model";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.delete(
  "/api/datamodel/:datamodelId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { datamodelId } = req.params;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "DataModel", "Request Query: " + datamodelId.toString());
    const datamodel = await Datamodel.findByIdAndUpdate(datamodelId, { isActive: false });
    if (!datamodel) {
      await logActivity(company_id, user_id, "DataModel", "DataModel doesn't exists.");
      throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "DataModel", "DataModel Deleted Successfully.");
    res.status(204).send(datamodel);
  }
);

export { router as deleteDatamodelRouter };
