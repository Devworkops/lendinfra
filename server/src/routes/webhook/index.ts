import { Request, Response } from "express";
import express from 'express';
import { Webhook } from "../../models/webhook";

const router = express.Router();

router.get(
  "/api/webhook/settings",
  async (req: Request, res: Response) => {
    const company = req.query.company_id as string;
    const user = req.query.user_id as string;

    try {
      // Validate required fields
      if (!company || !user) {
        return res.status(400).send({ error: 'Missing required query parameters' });
      }

      // Find the existing settings
      const existingSettings = await Webhook.findOne({ company, user });
      return res.send({
        webhook: existingSettings
      })
      
    } catch (error) {
      console.error("Error fetching webhook settings:", error);
      // Return a 500 status in case of error
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
);

export { router as getWebhookSetting };
