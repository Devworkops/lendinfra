import express, { Request, Response } from "express";
import { body } from "express-validator";
import {validateRequest} from "../../middleware/validate-request";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {User} from "../../models/user";
import {NotAuthorizedError} from "../../errors/not-authorized-error";
import {isAdmin} from "../../helper/checkRole";
import {BadRequestError} from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post(
    "/api/users/delete",
    [body("id").notEmpty().isMongoId().withMessage("Please provide vaild id")],
    validateRequest,
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        try{
        const admin = await User.findOne({ _id: req.currentUser!.id });

        // Check if the use who is loggedin is a superadmin(Authorization)
        if (!isAdmin(admin?.roles!)) throw new NotAuthorizedError();

        const { id } = req.body;

        // Prevent the super admin to delete themselves
        if (req.currentUser?.id === id)
            throw new BadRequestError("Sorry, cannot proceed.");

        const user = await User.findOneAndDelete({ _id: id });
        if (!user) {
            throw new Error("Sorry, cannot proceed");
        }

        res.status(201).send({ message: `The user ID: ${id} has been deleted` });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({ errors: [{ message: (error as Error).message }] });
      }
    }
);

export { router as deleteUserRouter };
