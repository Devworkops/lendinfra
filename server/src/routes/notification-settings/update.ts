import { Request, Response } from "express";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import express from 'express';
import { User } from "../../models/user";
import { BadRequestError } from "../../errors/bad-request-error";
const router = express.Router();
let company_id: string | undefined = "";
let user_id: string | undefined = "";

router.post(
  "/api/notification/settings/:user_id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    let company_id = req.query.company_id;
    let user_id = req.params.user_id;
    const { email } = req.body;

    try {
      const getNotificationSettings = await User.findOneAndUpdate({ company: company_id, _id: user_id }, { 
        $set: { 'notificationSetting.email':  email  }
       });

      if (!getNotificationSettings) {
        return res.status(404).send({ errors: 'User not found' });
      }
      return res.status(200).send({user:getNotificationSettings});

    } catch (error) {
      return res.send({ errors: [{ messages: (error as Error).message }] });
    }
  }
);

export { router as updateNotificationSettingsRouter };