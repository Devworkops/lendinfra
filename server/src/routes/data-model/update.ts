import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { Datamodel } from "../../models/data-model";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.put(
  "/api/datamodel/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    const datamodel = await Datamodel.findById(req.params.id);

    if (!datamodel) {
        await logActivity(company_id, user_id, "DataModel", "DataModel doesn't exists.");
        throw new NotFoundError();
    }
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;

    if (req.body.name !== undefined) {
      datamodel.name = req.body.name;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Name" + datamodel.name.toString());
    }

    if (req.body.description !== undefined) {
      datamodel.description = req.body.description;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Description" + datamodel.description.toString());
    }

    if (req.body.company !== undefined) {
      datamodel.company = req.body.company;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Company" + datamodel.company.toString());
    }

    if (req.body.createdBy !== undefined) {
      datamodel.createdBy = req.body.createdBy;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Created By" + datamodel.createdBy.toString());
    }

    if (req.body.type !== undefined) {
      datamodel.type = req.body.type;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Type" + datamodel.type.toString());
    }

    if (req.body.properties !== undefined) {
      datamodel.properties = req.body.properties;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Properties" + datamodel.properties.toString());
    }

    if (req.body.required !== undefined) {
      datamodel.required = req.body.required;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Required" + req.body.required.toString());
    }


    if (req.body.isActive !== undefined) {
      datamodel.isActive = req.body.isActive;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Active" + req.body.isActive.toString());
    }

    if (req.body.primaryKeys !== undefined) {
      datamodel.primaryKeys = req.body.primaryKeys;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Primary Keys" + datamodel.primaryKeys.toString());
    }

    if (req.body.secondaryKeys !== undefined) {
      datamodel.secondaryKeys = req.body.secondaryKeys;
      await logActivity(company_id, user_id, "DataModel", "Updating DataModel Secondary Keys" + req.body.secondaryKeys.toString());
    }
    await logActivity(company_id, user_id, "DataModel", "Updating DataModel Body: " + datamodel.toString());

    await datamodel.save();
    await logActivity(company_id, user_id, "DataModel", "DataModel updated successfully. " + datamodel.toString());

    res.send(datamodel);
  }
);

export { router as updateDatamodelRouter };
