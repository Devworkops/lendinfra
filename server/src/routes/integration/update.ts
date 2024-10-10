import express, { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { Integration } from "../../models/integration";
import { logActivity } from "../../helper/log";
import { getAvailableIntegrationSetup } from "../../helper/integrationSetup";
import { Company } from "../../models/company";
import { BadRequestError } from "../../errors/bad-request-error";
import { notfication } from "../../helper/notification";

const router = express.Router();

router.put(
  "/api/integration/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const companyId = req?.currentUser?.companyId;
    
    const existingCompany = await Company.findById(companyId);
    
    if (!existingCompany) {
      throw new BadRequestError("Company doesn't exist");
    }
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      await notfication(req?.currentUser?.companyId, req.currentUser?.id, "intigration", "Something went wrong while updating "+req.body.name + "intigration", '');
      throw new NotFoundError();
    }

    if (integration.isActive == false && req.body.isActive !== undefined) {

      integration.isActive = req.body.isActive;
      // Deactivate other integration of same type
      // const integrations = await Integration.find({type: integration.type, isActive: true, company: integration.company});
      // const integrationsToupdate = [];
      // if (integrations.length > 0) {
      //   for (const t of integrations) {
      //     t.isActive = false;
      //     const updateDoc = {
      //       "updateOne": {
      //         "filter": {"_id": t._id},
      //         "update": t,
      //         "upsert": false,
      //       },
      //     };
      //     integrationsToupdate.push(updateDoc);
      //   }

      // @ts-ignore
      //   await Integration.collection.bulkWrite(integrationsToupdate, () => { });
      // }
    }

    if (req.body.metaFields !== undefined) {
      integration.metaFields = req.body.metaFields;
    }

    const {allIntegrations} = await getAvailableIntegrationSetup( [], existingCompany.id);
    const currentIntegration = allIntegrations.find(integrationData => integrationData.name === req.body.name );
    if (currentIntegration && currentIntegration.metaFields) {
      
      currentIntegration.metaFields.map(metafield => {
        if(!integration.metaFields?.find(mf => mf.key === metafield.key)){
          integration.metaFields?.push(metafield);
        }
      })
    }
    if (currentIntegration && currentIntegration.actions) {
      const actions = currentIntegration.actions
      //@ts-ignore
      integration.actions = actions
    }
    await integration.save();

    res.send(integration);
  }
);

export { router as updateIntegrationRouter };
