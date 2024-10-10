import express, { Request, Response } from "express";
import {
    NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { User } from "../../models/user";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
    "/api/user/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {

        const query:any = {};
        if (req.query.emailId) {
          query.emailId = req.query.emailId;
        }

        const user = await User.find({email:req.query.emailId})
        if (!user) {
            throw new NotFoundError();
        }

        res.send(user);
    }
);

export { router as indexUserRouter };
