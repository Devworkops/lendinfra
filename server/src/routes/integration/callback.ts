import express, {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Integration, IntegrationType} from "../../models/integration";
import {logActivity} from "../../helper/log";
import { notfication } from "../../helper/notification";

const router = express.Router();

router.post(
    "/api/integration/callback/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const {companyId} = req.body;

        // Only integration will be active
        // Get existing Integrations
        const integration = await Integration.findOne({company: companyId, isActive: true, type: IntegrationType.api});
        
        if (integration && integration != null) {
          switch (integration.name) {
            case "AccountingIntegration.xero":

              res.send({message: "Xero Configured Successfully!"});
              break;
            default:
              await notfication(req?.currentUser?.companyId, req.currentUser?.id, "integration", "Something went wrong with Integration", '');
              res.send("Sorry, something went wrong");
              break;
          }
        } else {
          await notfication(req?.currentUser?.companyId, req.currentUser?.id, "integration", "No active integration", '');
          res.send("No active integration");
        }
      } catch (err) {
        await notfication(req?.currentUser?.companyId, req.currentUser?.id, "integration", "Something went wrong with Integration", '');
        res.send("Sorry, something went wrong");
      }
    }
);

export {router as callbackIntegrationRouter};
