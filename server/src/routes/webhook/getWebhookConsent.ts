import { Request, Response } from "express";
import { validationResult } from "express-validator";

import express from 'express';
import { WorkflowManager } from "../../classes/WorkflowManager";
import { currentUser } from "../../middleware/current-user";
import { WebhookEvent } from "../../models/webhook-events";
const router = express.Router();
router.post(
  "/api/webhook/:companyId",
  currentUser,
  async (req: Request, res: Response) => {
    const company = req?.params?.companyId;
    try {
      const eventData = req.body;

      const newWebhookEvent = new WebhookEvent({
        consent_id: eventData.id,
        new_status: eventData.new_status,
        company: company,
        notification_utc_time: eventData.notification_utc_time,
        timestamp: new Date()
      });
      await newWebhookEvent.save();

      res.status(200).send('Records processed');
    } catch (error) {
      console.error('Error processing records:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

export { router as getConsentFromWebhook };
