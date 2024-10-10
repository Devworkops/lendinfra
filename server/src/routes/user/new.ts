import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import path from "path";

import { User } from "../../models/user";
import { UserToCompany } from "../../models/user-company";
import { validateRequest } from "../../middleware/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import MailUtil from "../../helper/MailUtil";
import { v4 as uuidv4 } from "uuid";
import { Password } from "../../helper/password";
import { Company } from "../../models/company";
import { logActivity } from "../../helper/log";

const router = express.Router();

router.post(
    "/api/user/new",
    currentUser,
    requireAuth,
    [
        body("email").isEmail().withMessage("Email must be valid"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        let { email, password, firstName, lastName, roles, company } = req.body;
        try {
            email = email.toLowerCase();
            const existingUser = await User.findOne({ email });
            const companyRecord = await Company.findById(company)
            let text = "";
            let updatedUser;
            if (existingUser) {
                const companyUser = await UserToCompany.findOne({ user: existingUser.id, company: company });
                if (companyUser) {
                    throw new BadRequestError("This Email already in use");
                }
                const updatedAssoc = UserToCompany.build({ user: existingUser.id, company: company });
                if (roles) updatedAssoc.roles = roles;
                await updatedAssoc.save();
                updatedUser = existingUser;
                firstName = existingUser.firstName;
                lastName = existingUser.lastName;
                text = `Dear ${firstName} ${lastName},
You have just been added to the ${companyRecord?.companyName} team at LendInfra.

Thank you,
LendInfra Team`;

            } else {
                if (firstName === "" || lastName === "") {
                    throw new BadRequestError("Enter valid First Name and Last Name for new user");
                }
                const newUser = User.build({ firstName, lastName, email, password, company });
                if (roles) {
                    newUser.roles = roles;
                }

                // send mail to user
                const uuid = uuidv4();
                const reset_password_token = await Password.toHash(uuid);
                const reset_password_token_expiry = Date.now() + 1000 * 60 * 30;

                newUser.set({
                    reset_password_token,
                    reset_password_token_expiry,
                });

                updatedUser = await newUser.save();
                if (!updatedUser) throw new Error("Sorry, cannot proceed.");
                const userToCompanyAssoc = UserToCompany.build({ user: updatedUser.id, company: company });
                if (roles) {
                    userToCompanyAssoc.roles = roles;
                }
                await userToCompanyAssoc.save();
                const restURL = path.join(`${process.env.CLIENT_URI}`.replace('https:/', 'https://'), `reset-password?tokenId=${reset_password_token}`)
                text =
                    `
                Dear ${firstName} ${lastName},
                    You have just been added to the ${companyRecord?.companyName} team at LendInfra. You can finish your account set-up by clicking on the below link.
                    ${restURL.replace('https:/', 'https://')}

                Thank you,
                LendInfra Team
                `;
            }

            await MailUtil.sendMail(email as string, '', 'Welcome to LendInfra!', text, '');
            res.status(201).send(updatedUser);


        } catch (error) {
            console.log(error);
            throw error;
        }


    }
);

export { router as createUserRouter };
