import express, { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import {Datamodel} from "../../models/data-model";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.delete(
  "/api/company/:companyId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      throw new NotFoundError();
    }

    const accountDataModel = await Datamodel.findOne({ company: companyId, name: "Account" });
    if (!accountDataModel) {
        throw new NotFoundError();
    }

      const applicationDataModel = await Datamodel.findOne({ company: companyId, name: "Application" });
      if (!applicationDataModel) {
          throw new NotFoundError();
      }

    // Mark as inactive
    await company.updateOne({isActive:false});
    await accountDataModel.updateOne({isActive: false});
    await applicationDataModel.updateOne({isActive: false});

    res.status(204).send(company);
  }
);

export { router as deleteCompanyRouter };
