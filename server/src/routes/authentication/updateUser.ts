import { currentUser } from '../../middleware/current-user'
import { requireAuth } from "../../middleware/require-auth";
import { NotAuthorizedError } from "../../errors/not-authorized-error";

import express, { Request, Response } from "express";
import { User } from "../../models/user";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.put(
  "/api/users/updateUserInfo/:userId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const existingUser = await User.findOne({ _id: req.params.userId });

      if (!existingUser) throw new NotAuthorizedError();

      // if (existingUser.token_version !== req.currentUser?.token_version) {
      //   throw new Error("Not authenticated");
      // }

      // Update user info in the database
      if (req.body.firstName) existingUser.firstName = req.body.firstName;
      if (req.body.lastName) existingUser.lastName = req.body.lastName;

      const updatedUser = await existingUser.save();
      if (!updatedUser) throw new Error("Sorry, cannot proceed.");

      res
        .status(200)
        .send({ message: `The user ID: ${existingUser.id} has been updated` });
    }
    catch (error) {
      console.log(error);
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as updateUserInfoRouter };
