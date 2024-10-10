import express, {Request, Response} from "express";
import { DataRecord, DataRecordDoc } from "../../models/data-record";
import {logActivity} from "../../helper/log";

const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

const triggerTwilioFlow =async (contract: DataRecordDoc, user: DataRecordDoc | null) => {
  let phoneNumber: string = (user as any)?.fields?.Phone ?? '';
  // phoneNumber = '+91' + phoneNumber;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
      console.error('Twilio credentials are missing. Please check your environment variables.');
      return;
  }

  const client = require('twilio')(accountSid, authToken);
  const flowId = 'FW935bfb9b2fac9dd17a97dd8194a350cc';
  const fromNumber = 'MG908f58b945acc7c29c206241f46f159d';
  const toNumber = `whatsapp:${phoneNumber}`;

  client.studio.v1.flows(flowId)
  .executions
  .create({
    parameters: {
      reason: 'VRP Consent',
      contract: contract,
      user:user
    },
    from: fromNumber,
    to: toNumber
  })
  .then((message: any) => {
      console.log("Message " + JSON.stringify(message, null, 2))
      console.log("Message SID" + message.sid)
    }
  )
  .catch((error: any) => console.error('Error executing the flow: ', flowId));

}

router.post(
    "/api/zoho/status",
    async (req: Request, res: Response) => {
      try {
        console.log(req.body)

        const contract = await DataRecord.findOne({objectName: 'Contract', 'fields.DocumentId': req.body.requests.request_id});
        if(!contract){
          res.status(400).send({message: "No contract found linked with this document"});
          return;
        }

        contract.fields = {
          ...contract.fields,
          DocumentId: req.body.requests.request_id,
          DocumentStatus: req.body.requests.request_status
        }
        contract.save();

        const userId: any = (contract?.fields as Record<string, unknown>)?.['AccountId'];
        const user: DataRecordDoc | null = await DataRecord.findById(userId)

        triggerTwilioFlow(contract, user);

        res.status(200).send({message: 'Document has been signed.'});
        return;
      } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "Zoho", "Error while connecting zoho: " + (error as Error).message.toString());
        console.log(error);
        return res.send({message: error});
      }
    }
);

export {router as updateDocStatus};
