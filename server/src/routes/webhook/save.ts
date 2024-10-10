import { Request, Response } from "express";
import { validationResult } from "express-validator";

import express from 'express';
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { Webhook } from "../../models/webhook";

const router = express.Router();

router.post(
  "/api/webhook/settings",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    let company = req.query.company_id;
    let user = req.query.user_id;
    const { url } = req.body
    console.log("into --------------------------------", company, user, url)
    try {
      if (!company || !user || !url) {
        return res.status(400).send({ error: 'Missing required fields' });
      }

      const existingSettings = await Webhook.findOne({ company, user });

      if (existingSettings) {
        // Update existing settings
        existingSettings.url = url;
        await existingSettings.save();
        return res.status(200).send({ message: 'Webhook settings updated successfully' });
      } else {
        // Create new settings
        const newSettings = new Webhook({ company, user, url });
        await newSettings.save();
        return res.status(201).send({ message: 'Webhook settings created successfully' });
      }
    } catch (error) {
      console.error("Error saving webhook settings:", error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
);

export { router as saveWebhookSetting };
