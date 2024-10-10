import { NotFoundError } from "../../errors/not-found-error";
import { validateRequest } from "../../middleware/validate-request";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post(
  "/api/users/resetPassword",
  [
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
    body("token").notEmpty().withMessage("Please provide valid token"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const existingUser = await User.findOne({ reset_password_token: token });
    if (!existingUser) throw new NotFoundError();

    // Check if the token is expired
    if (!existingUser.reset_password_token_expiry) {
      throw new BadRequestError("Sorry, cannot proceed");
    }

    const isTokenExpired =
      existingUser.reset_password_token_expiry < Date.now();

    if (isTokenExpired) {
      throw new BadRequestError("Reset password token expired");
    }

    // Update user info in the database
    existingUser.set({
      reset_password_token: "",
      reset_password_token_expiry: 0,
      password,
      isActive: true,
    });
    const updatedUser = await existingUser.save();
    if (!updatedUser) throw new BadRequestError("Sorry, cannot proceed.");

    res.status(200)
      .send({
        message: `Successfully reset your password, Please login to proceed`,
      });
  }
);

export { router as resetPasswordRouter };
