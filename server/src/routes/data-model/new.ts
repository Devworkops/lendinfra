import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { validateRequest } from "../../middleware/validate-request";
import { Datamodel } from "../../models/data-model";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = "";
let user_id: string | undefined = "";

router.post(
  "/api/datamodel/new",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const { name, label, description, company, createdBy, type, properties, required , primaryKeys, secondaryKeys, prefix} = req.body;
      let newLabel = label;
      if (!newLabel){
          newLabel = name;
      }
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "DataModel", "Request Query: " + req.body.toString());

      const datamodel = Datamodel.build({ name, label: newLabel, description, company, createdBy, type, properties, required, primaryKeys , secondaryKeys, prefix});
      await datamodel.save();
      await logActivity(company_id, user_id, "DataModel", "DataModel Created." + datamodel.toString());
      res.status(201).send(datamodel);
    } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "DataModel", "Error while creating DataModel. " + (error as Error).message.toString());
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as createDatamodelRouter };
