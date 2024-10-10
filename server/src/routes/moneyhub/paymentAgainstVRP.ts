import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import express, {Request, Response} from 'express';
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post("/api/moneyhub/vrpPayment", async (req: Request, res: Response) => {
    try {
    const moneyhub = await moneyHubClient();
    const { amount, vrpId, payeeId} = req.body;
    const amountInPence = amount*100;

    const recurringPayment = await moneyhub.makeRecurringPayment({
        recurringPaymentId: vrpId,
        payment: {
          payeeId: payeeId, // optional
          amount: amountInPence,
          payeeRef: "Payee ref",
          payerRef: "Payer ref",
        },
      });

      console.log(recurringPayment);

    res.status(200).send(recurringPayment);
    return;
  } catch (e: any) {
    console.error("Error occurred while getting recurring payments from customer's bank", e);
    res.status(500).send( {error: e.error_description});
  }
});

export { router as vrpPayment };
