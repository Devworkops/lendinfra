import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { Company } from "../../models/company";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.put(
  "/api/company/:id",
  // currentUser,
  // requireAuth,
  [
    body("companyName")
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage("Please provide valid company Name"),
    body("address")
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage("Please provide valid company Address"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const company = await Company.findById(req.params.id);
      if (!company) {
        throw new NotFoundError();
      }
      if (req.body.companyName !== undefined || req.body.address != undefined) {
        if (req.body.companyName !== company.companyName) {
          const existingCompany = await Company.findOne({ companyName: req.body.companyName });
          if (existingCompany) {
            throw new BadRequestError("This Company name is not available.");
          } else {
            company.companyName = req.body.companyName;
          }
        }
        if (req.body.address !== company.address) {
          company.address = req.body.address;
        }

        await company.save();
      }
      return res.send(company);
    }
    catch (error) {
      return res.send({ errors: [{ message: (error as Error).message }] });
    };
  });

export { router as updateCompanyRouter };
