import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Datamodel } from "../../models/data-model";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/datamodel/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "DataModel", "Request Parameter: " + req.params.id);

    const datamodel = await Datamodel.findById(req.params.id)
    if (!datamodel) {
        await logActivity(company_id, user_id, "DataModel", "DataModel doesn't exists.");
        throw new NotFoundError();
    }

    await logActivity(company_id, user_id, "DataModel", datamodel.toString());
    res.send(datamodel);
  }
);

export { router as showDatamodelDetailRouter };
