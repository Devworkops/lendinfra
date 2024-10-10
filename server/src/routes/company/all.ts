import express, { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import {UserToCompany} from "../../models/user-company";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
  "/api/company/all",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
      const userCompanies = await UserToCompany.find({user: req.currentUser?.id});
      const companies = [];
      for (const userCompany of userCompanies) {
          const company = await Company.findOne({_id: userCompany.company})
          companies.push(company);
      }
      res.send(companies);
  }
);

export { router as allCompanyRouter };
