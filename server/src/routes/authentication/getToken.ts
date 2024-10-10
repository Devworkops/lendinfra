import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { Password } from "../../helper/password";
import { User , Provider} from '../../models/user';
import { UserToCompany } from "../../models/user-company";
import { validateRequest } from "../../middleware/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post(
  "/api/users/getToken",
  [
    body("email").toLowerCase().isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try{
    let { email, password } = req.body;
    email = email.toLowerCase();
    // First check if user already exist
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    // Validate the password
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    let activeUser = await UserToCompany.findOne({user: existingUser.id, company: existingUser.company, status: true});
    if(!activeUser){
      activeUser = await UserToCompany.findOne({user: existingUser.id, status: true});
      if(activeUser){
        existingUser.company = activeUser.company;
        await existingUser.save();
          // throw new BadRequestError("User is De-activated from all his/her companies");
      }
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        token_version: existingUser.token_version,
        companyId:existingUser.company,
        roles:existingUser.roles.toString()
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };
    res.send({accessToken:userJwt});
  }
  catch (error) {
    console.log(error);
    res.status(400).send({ errors: [{ message: (error as Error).message }] });
  }
}
);
export { router as gettokenRouter };
