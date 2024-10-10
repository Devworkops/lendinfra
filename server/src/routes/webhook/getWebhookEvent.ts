import { Request, Response } from "express";
import express from 'express';
import { Webhook } from "../../models/webhook";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { WebhookEvent } from "../../models/webhook-events";

const router = express.Router();

router.get(
  "/api/webhook/events",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const company_id = req.query.company_id as string;
    try {
      // Find the existing settings
      const webhookEvents = await WebhookEvent.find({ company:company_id}).sort({ createdAt: -1 });;
      return res.status(500).send({
        events: webhookEvents
      })
      
    } catch (error) {
      console.error("Error fetching webhook settings:", error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
);

export { router as getWebhookEvents };
