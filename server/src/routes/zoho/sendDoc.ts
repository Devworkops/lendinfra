import express, {Request, Response} from "express";
import { DataRecord, DataRecordDoc } from "../../models/data-record";
import { ZohoSign } from "../../Integrations/Implementaion/ZohoSign";
import { BadRequestError } from "../../errors/bad-request-error";
import { Integration, IntegrationType, Integrations } from "../../models/integration";

const router = express.Router();


router.post(
    "/api/zoho/sendDoc",
    async (req: Request, res: Response) => {
      try {
          
        const { userId, contractId } = req.body;
        console.log(userId, contractId);

        const user = await DataRecord.findById(userId)
        const contract = await DataRecord.findById(contractId)
        
        if(!user || !contract){
            throw new BadRequestError('user or contract data not found');
        }
        const companyId: string = user.company.toString();
        console.log(companyId)
        const integrationZohoSign = await Integration.findOne({ name: Integrations.zoho, company: companyId, isActive: true, type: IntegrationType.api })
        if (!integrationZohoSign) {
            throw new BadRequestError("Invalid Integration");
        }
        
        const zohoSign = new ZohoSign(companyId, integrationZohoSign);
        const docData = await zohoSign.execute('sendDoc', user, contract);

        if(contract){
            contract.fields= {
                ...contract.fields,
                DocumentStatus: docData.requests.request_status,
                DocumentId: docData.requests.request_id
            }
            await contract.save();
        }

        res.status(200).send({message: 'Document has been send.'});
        return;
      } catch (error) {
        console.log(error);
        res.send({message: error});
        return;    
      }
    }
);

export {router as sendDoc};
