import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import express, {Request, Response} from 'express';
import {logActivity} from "../../helper/log";
import { BadRequestError } from "../../errors/bad-request-error";

const router = express.Router();

router.post("/api/moneyhub/vrpConsent", async (req: Request, res: Response) => {
    try {
    const moneyhub = await moneyHubClient();
    const { vrpId } = req.body;
    const recurringPaymentConsentStatus = await moneyhub.getRecurringPayment({
        recurringPaymentId: vrpId,
    });

    res.status(200).send(recurringPaymentConsentStatus);
    return;
  } catch (e) {
    console.error("Error occurred while getting recurring payments status", e);
    res.status(500).send({message:(e as Error).message });
    throw (e as Error).message;
  }
});

export { router as vrpConsent };
