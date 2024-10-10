import express, { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
  "/api/company/:companyId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const company = await Company.findById(req.params.companyId);
    if (!company) {
      throw new NotFoundError();
    }
    res.send(company);
  }
);

export { router as showCompanyDetailRouter };
