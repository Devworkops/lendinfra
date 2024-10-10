import express, {Request, Response} from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import {getAvailableIntegrationSetup} from "../../helper/integrationSetup";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import { Company } from "../../models/company";
import {Integration} from "../../models/integration";
import {logActivity} from "../../helper/log";
import { notfication } from "../../helper/notification";

// Here we will fetch all integrations of a company
const router = express.Router();

router.get(
    "/api/integration/all/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      try {

        const companyId = req?.currentUser?.companyId;
        // Check valid company
        const existingCompany = await Company.findById(companyId);
        
        if (!existingCompany) {
          await notfication(req?.currentUser?.companyId, req.currentUser?.id, "integration", "Something went wrong, company doesn't exist ",'');
          throw new BadRequestError("Company doesn't exist");
        }
        
        // Get existing Integrations
        const integrations = await Integration.find({company: companyId, isVisible: true});
        
        // Add available integration
        const {allIntegrations, availableIntegrations} = await getAvailableIntegrationSetup(integrations, companyId?companyId:existingCompany._id);
        
        return res.send({integrations, availableIntegrations, allIntegrations});
      } catch (error) {
        console.log("error",error)
        return res.send({message: error});
      }
    }
);

export {router as allIntegrationsRouter};
