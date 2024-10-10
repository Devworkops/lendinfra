import express, { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { TransUnion } from "../../Integrations/Implementaion/TransUnion";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import { Integration, Integrations, IntegrationType } from "../../models/integration";
import { Trustloop } from "../../Integrations/Implementaion/Trustloop";
import { ZohoSign } from "../../Integrations/Implementaion/ZohoSign";
import { notfication } from "../../helper/notification";

const router = express.Router();
let user_id: string | undefined = '';

router.get(
  "/api/integration/connect?",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      user_id = req?.currentUser?.id;
      const companyId = req?.currentUser?.companyId;
      // Check valid company
      const existingCompany = await Company.findById(companyId);

      if (!existingCompany) {
        await notfication(companyId, user_id, "integration", "Company doesn't exist", '');
        throw new BadRequestError("Company doesn't exist");
      }

      const { name } = req.query;
      const integration = await Integration.findOne({ name, company: existingCompany.id, type: IntegrationType.api })
      if (!integration) {
        await notfication(companyId, user_id, "integration", "Something went wrong with "+req.query.name+ "Integration", '');
        throw new BadRequestError("Invalid Integration");
      }

      switch (name) {
        case Integrations.transUnion:
          // By creating object, it will verify the response
          const transUnion = new TransUnion(existingCompany._id, integration);
          integration.isActive = true;
          await integration.save()
          res.send({ message: 'Connected Successfully' })
          break;
        case Integrations.trustloop:
          // By creating object, it will verify the response
          const trustloop = new Trustloop(existingCompany._id, integration);
          const authToken = await trustloop.getAuthToken()
          if (!authToken) {
            await notfication(companyId, user_id, "integration", "Something went wrong with getting Trustloop Auth Token", '');
            integration.isActive = false;
            await integration.save()
            res.send('Failed')
          } else {
            integration.isActive = true;
            await integration.save()
            res.send({ message: 'Connected Successfully' })
          }
          break;
        case Integrations.twilio:
          // By creating object, it will verify the response
          integration.isActive = true;
          await integration.save()
          res.send({ message: 'Connected Successfully' })
          break;
        case Integrations.zoho:
          // By creating object, it will verify the response
          const zoho = new ZohoSign(existingCompany._id, integration);
          const zohoAuthToken = await zoho.getAuthToken()
          if (!zohoAuthToken) {
            await notfication(companyId, user_id, "integration", "Something went wrong with getting Zoho Auth Token", '');
            integration.isActive = false;
            await integration.save()
            res.send('Failed')
          } else {
            res.send({ message: 'Connected Successfully' })
          }
          break;
          case Integrations.lendXP:
          // By creating object, it will verify the response
          integration.isActive = true;
          await integration.save()
          res.send({ message: 'Connected Successfully' })
          break;
        default:
          await notfication(companyId, user_id, "integration", "Integration name not found while connecting!!!", '');
          res.status(400).send({ errors: [{ message: "Integration name not found!!!" }] });
          break;
      }
    } catch (error) {
      console.log("error",error);
      await notfication(req?.currentUser?.companyId, req?.currentUser?.id, "integration", "Something went wrong while connecting with " +req.query.name+" !!!", '');
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as connectIntegrationRouter };
