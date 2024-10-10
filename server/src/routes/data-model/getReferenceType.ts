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
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/dataModel/reference",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const companyId = req?.currentUser?.companyId;

      const dataModels = await  Datamodel.find({isActive:true, company:companyId}).lean();

        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "DataModel", "Getting DataModel Reference.");

      let referenceType = [];
      for(let dataModel of dataModels){
        referenceType.push({id:dataModel.name, label:dataModel.label})
      }
        await logActivity(company_id, user_id, "DataModel", "Response: " + referenceType.toString());
        res.status(201).send(referenceType);
    } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "DataModel", "Error while getting the reference type. " + (error as Error).message.toString());
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as getDataModelReferenceRouter };
