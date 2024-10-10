import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import express, {Request, Response} from 'express';
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post("/api/moneyhub/vrpConsentUrl", async (req: Request, res: Response) => {
  try {
    let { userId } = req.body;
    userId = userId.slice(0, 18);

    const bankId = 'test';

    const moneyhub = await moneyHubClient();

    const currentDate = new Date();
    const validFromDate = currentDate.toISOString();
    const payeeId = '2923de6b-afba-4780-a651-1cb21a4bad30';
    const validToDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 12)
    ).toISOString();

    const vrpAuthoriseUrl = await moneyhub.getRecurringPaymentAuthorizeUrl({
      bankId,
      payeeId,
      reference: userId,// data record ID
      validFromDate,
      validToDate,
      maximumIndividualAmount: 50000,
      currency: "GBP",
      periodicLimits: [
        {
          amount: 50000,
          currency: "GBP",
          periodType: "Month",
          periodAlignment: "Consent",
        },
      ],
      context: "PartyToParty",
      type: "Sweeping",
      state: "state-value",
      nonce: "nonce-value",
    });

    res.status(200).send({url :vrpAuthoriseUrl});
    return;
  } catch (e) {
    console.error("Error occurred while generating recurring payment URL", e);
    res.status(500).send({message:(e as Error).message });
    throw (e as Error).message;
  }
});

export { router as vrpConsentUrl };
