import express, {Request, Response} from "express";
import {User} from "../../models/user";
import {v4 as uuidv4} from "uuid";
import {Password} from "../../helper/password";
import MailUtil from "../../helper/MailUtil";
import {BadRequestError} from "../../errors/bad-request-error";
import path from "path";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
    "/api/users/resetPassword?",
    async (req: Request, res: Response) => {
        try {
            const {email} = req.query;
            const user = await User.findOne({email: email});
            if (!user) {
                throw new BadRequestError("Email not found");
            }

            const uuid = uuidv4();
            const reset_password_token = await Password.toHash(uuid);
            const reset_password_token_expiry = Date.now() + 1000 * 60 * 30;

            user.set({
                reset_password_token,
                reset_password_token_expiry,
            });

            const updatedUser = await user.save();
            if (!updatedUser) throw new Error("Sorry, cannot proceed.");
            const text = path.join(`${process.env.CLIENT_URI}`, `reset-password?tokenId=${reset_password_token}`);
            try {
                await MailUtil.sendMail(email as string, '', 'Reset Password', text, '');
            } catch (error) {
                console.log(error);
            }

            res.status(200).send({message: "Please Check you email to reset password"});
        } catch (error) {
            console.log(error);
            res.status(400).send({errors: [{message: (error as Error).message}]});
        }
    }
);

export {router as resetPasswordRequestRouter};
