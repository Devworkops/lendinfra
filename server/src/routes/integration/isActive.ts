import express, {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Integration} from "../../models/integration";
import {logActivity} from "../../helper/log";

// Here we will fetch all integrations of a company
const router = express.Router();

router.get(
    "/api/integration/find/isActive/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {

      try {
        const {type, companyId} = req.query;

        // Get existing Integrations
        const integration = await Integration.findOne({company: companyId, isActive: true, type});

        if (integration) {

          return res.send({integration: integration});
        }

        return res.send({integration: null});
      } catch (error) {
        console.log("error---------",error);
        return res.send({message: error});
      }
    }
);

export {router as activeIntegrationRouter};
