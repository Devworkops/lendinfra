import express, { Request, Response } from "express";
import { currentUser } from '../../middleware/current-user'
import { requireAuth } from '../../middleware/require-auth'
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User , RoleOptions} from '../../models/user';
import { UserToCompany } from "../../models/user-company";
import { validateRequest } from "../../middleware/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.put(
  "/api/users/switchCompany",
  currentUser,
  requireAuth,
  [
    body("companyId").notEmpty().isMongoId().withMessage("Please provide vaild id")],
  validateRequest,
  async (req: Request, res: Response) => {
    // First check if user already exist
    const {companyId} = req.body;
    if (!req.currentUser!.id) throw new BadRequestError("Please login to proceed.");
    const existingUser = await User.findOne({ _id: req.currentUser!.id });
    if (!existingUser) throw new BadRequestError("Not authenticated ");

    existingUser.company = companyId;
    await existingUser.save();
    const userAssoc = await UserToCompany.findOne({user: existingUser.id, company: companyId});
    let userRoles: RoleOptions[] = [RoleOptions.admin]
    if(userAssoc?.roles){
      userRoles = userAssoc.roles;
    }

    req.session = null;
    // Generate a new JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        token_version: existingUser.token_version,
        companyId: companyId,
        roles:userRoles.toString()
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as switchCompanyRouter };
