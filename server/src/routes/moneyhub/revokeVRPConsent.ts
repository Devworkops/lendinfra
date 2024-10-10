import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import express, {Request, Response} from 'express';

const router = express.Router();

router.get("/api/moneyhub/revoke", async (req: Request, res: Response) => {
    try {
        const { vrpId } = req.query;
        console.log(vrpId);
        const moneyhub = await moneyHubClient();
        const revokedRecurringPayment = await moneyhub.revokeRecurringPayment({
            recurringPaymentId: vrpId
        });
        console.log(revokedRecurringPayment);

        res.status(200).send({ isRevoked: "Yes"})
        return;
    } catch (e) {
        res.status(500).send({ isRevoked: "No" });
        console.error("Error occurred while revoking vrp consent", e);
  }
});

export { router as revokeVRPConsent };
