import { currentUser } from '../../middleware/current-user'
import { requireAuth } from '../../middleware/require-auth'
import express, { Request, Response } from "express";
import { User } from "../../models/user";
import { BadRequestError } from '../../errors/bad-request-error';
import {logActivity} from "../../helper/log";

const router = express.Router();

router.get(
  "/api/users/signout",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    if (!req.currentUser!.id) throw new BadRequestError("Please login to proceed.");

    const existingUser = await User.findOne({ _id: req.currentUser!.id });

    if (!existingUser) throw new BadRequestError("Not authenticated ");
    // if (existingUser.token_version !== req.currentUser?.token_version) {
    //   throw new BadRequestError("Not authenticated : Invalid token version");
    // }

    // Update the token_version by increasing 1
    existingUser.token_version = existingUser.token_version + 1;
    const updatedUser = await existingUser.save();
    if (!updatedUser) throw new BadRequestError("Sorry, cannot proceed.");
    // @ts-ignore
    await logActivity(existingUser.company.toString(), existingUser.id.toString(), "Logout", "Logout Successful.");
    req.session = null;
    res.send({ message: "Goodbye" });
  }
);

export { router as signoutRouter };
