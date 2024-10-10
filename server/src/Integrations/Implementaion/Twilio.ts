import {IntegrationDoc} from "../../models/integration";
import { DataRecordDoc } from "../../models/data-record";

const triggerTwilioFlow =async (user: DataRecordDoc | null, contract: DataRecordDoc | null) => {
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
    const from = 'MG908f58b945acc7c29c206241f46f159d';
    const toNumber = `whatsapp:${phoneNumber}`;
  
    client.studio.v1.flows(flowId)
    .executions
    .create({
      parameters: {
        reason: 'Zoho Sign',
        user:user,
        contract: contract
      },
      from: from,
      to: toNumber
    })
    .then((message: any) => {
        console.log("Message " + JSON.stringify(message, null, 2))
        console.log("Message SID" + message.sid)
      }
    )
    .catch((error: any) => console.error('Error executing the flow: ', flowId, error));
}

export class Twilio {
    zohoSignConfig: IntegrationDoc
    company: string

    constructor(companyId: string, config: IntegrationDoc) {
        this.company = companyId;
        this.zohoSignConfig = config;
    }

    async execute (apiName: string, user: DataRecordDoc | null, contract: DataRecordDoc | null) {
        switch (apiName) {
            case 'startStudioFlowForZohoSign':
                return await this.startStudioFlow(user, contract);
            default:
                return null;
        }
    }

    async startStudioFlow(user: any, contract: any) {     
        try {
            await triggerTwilioFlow(user, contract);
        } catch (error: any) {
            console.error(error);
            throw new Error("Failed to send Zoho document");
        }
    }
    
}
