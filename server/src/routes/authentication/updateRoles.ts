import { currentUser } from '../../middleware/current-user'
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import { NotAuthorizedError } from "../../errors/not-authorized-error";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { RoleOptions, User } from "../../models/user";
import { isSuperAdmin } from "../../helper/checkRole";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post(
  "/api/users/updateroles",
  [body("id").notEmpty().isMongoId().withMessage("Please provide vaild id")],
  [
    body("roles")
      .notEmpty()
      .isArray()
      .custom((value) => {
        return value.every((v: RoleOptions) =>
          Object.values(RoleOptions).includes(v)
        );
      })
      .withMessage("Please provide vaild roles"),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { id, roles } = req.body;

      const admin = await User.findOne({ _id: req.currentUser!.id });

      // Check if the use who is loggedin is a superadmin(Authorization)
      if (!isSuperAdmin(admin?.roles!)) throw new NotAuthorizedError();

      // Prevent the super admin to update their own
      if (req.currentUser?.id === id)
        throw new BadRequestError("Sorry, cannot update own roles.");

      // Query the user (to be updated) info from the database
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new Error("Sorry, user not found!");
      }
      user.set({ roles });
      const updatedUser = await user.save();

      if (!updatedUser) {
        throw new Error("Sorry, cannot proceed");
      }

      res.status(200).send(updatedUser);
    }
    catch (error) {
      console.log(error);
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as updateRolesRouter };
