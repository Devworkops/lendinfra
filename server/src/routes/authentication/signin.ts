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
  "/api/users/signin",
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
    await logActivity(
        "",
        "",
        "Login",
        "Login Requested with Email: " + email);

    // First check if user already exist
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      await logActivity(
          "",
          "",
          "Login",
          "Email doesn't exist.");
      throw new BadRequestError("Invalid credentials");
    }

    // Check if the reset_password_token is not null
    /**if (existingUser.reset_password_token) {
      throw new Error("Please reset your password");
    }**/

    // Check if the user is facebook user or google user, force them to reset their password
    if (
      (!!existingUser.facebook_id &&
        existingUser.password === Provider.facebook) ||
      (!!existingUser.google_id && existingUser.password === Provider.google)
    ) {
      throw new Error("Please reset your password.");
    }

    // Validate the password
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      await logActivity(
          "",
          "",
          "Login",
          "Incorrect Password");
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

    // @ts-ignore
    await logActivity(existingUser.company.toString(), existingUser.id.toString(), "Login", "Login Successful");
    res.status(200).send(existingUser);
  }
  catch (error) {
    console.log(error);
    res.status(400).send({ errors: [{ message: (error as Error).message }] });
  }
}
);
export { router as signinRouter };
