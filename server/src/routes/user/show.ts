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
    "/api/user/:userId",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        const user = await User.findById(req.params.userId).populate("company");
        if (!user) {
            throw new NotFoundError();
        }

        res.send(user);
    }
);

export { router as showUserDetailRouter };
