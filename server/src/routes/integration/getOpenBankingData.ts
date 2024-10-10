import express, {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import { Integration, Integrations} from "../../models/integration";
import { Trustloop } from "../../Integrations/Implementaion/Trustloop";
import { BadRequestError } from "../../errors/bad-request-error";
import { DataRecord, DataRecordDoc } from "../../models/data-record";
import { Company } from "../../models/company";
import { NotFoundError } from "../../errors/not-found-error";

const router = express.Router();

const createConsent = async (dataRecord: DataRecordDoc, redirect_url?: string) => {
  const companyId = dataRecord.company;
  const company = await Company.findById(companyId);
  let company_name = '';
  if (company) {
      company_name = company.companyName;
  }
  const fields = dataRecord.fields;
  // @ts-ignore
  const salutation = "MR."
  // @ts-ignore
  const first_name = fields['FirstName']
  // @ts-ignore
  const last_name = fields['LastName']
  // @ts-ignore
  const psu_email = fields['Email']
  // @ts-ignore
  // const birth_date = fields['DateOfBirth'].split('T')[0]
  const birth_date = '2001-01-01';

  // @ts-ignore
  const phone_number = fields['Phone']
  // @ts-ignore
  const address = fields['Address']
  let newConsentBody = {
      "psu_email": psu_email,
      "exp_notification": true,
      "business": true,
      "psu_info": {
          "salutation": salutation,
          "first_name": first_name,
          "last_name": last_name,
          "postcode": 'LU13LU',
          "address_line_1": 'test',
          // "postcode": address['PostCode'],
          // "address_line_1": address['HouseNumber'],
          "address_line_2": 'test',
          "town": 'test',
          "county": 'U.K.',
          // "address_line_2": address['Street'],
          // "town": address['TownOrCity'],
          // "county": address['Country'],
          "birth_date": birth_date,
          "phone_number": phone_number,
          "account_holders_num": 0,
          "company_name": company_name,
          "company_number": "123"
      },
      "redirect_url": redirect_url,
      "data_visibility_lifetime_days": 90
  }
  console.log("New Consent Body:", newConsentBody);
  const consentParams: { value: any; key: string }[] = [
      { key: 'recordId', value: dataRecord?.id as any },
      { key: 'body', value: newConsentBody as any }
  ];
  return consentParams
}

const createAnalyticsParams = async (consentId: string, accountId: string) => {
  let fields;
  let analyticsParams: {key: string, value: any}[];
  let consentObjectId = consentId;
  let analyticsBody = {
      "blocks":[  "overview",
          "income",
          "income_summary",
          "behaviours",
          "expenditure",
          "expenditure_summary",
          "transactions",
          "transactions_summary",
          "affordability",
          "affordability_summary",
          "utilities",
          "collections"
      ]
  }
  const consent = await DataRecord.findById(consentObjectId);
  if (!consent) {
      throw new BadRequestError("Record ID not found");
  }
  fields = consent.fields;
  // @ts-ignore
  consentId = fields['consent_id']
  analyticsParams = [
      {key: 'recordId', value: accountId as any},
      {key: 'consentId', value: consentId},
      {key: 'body', value: analyticsBody as any}
  ];
  return analyticsParams;
}


router.post(
    "/api/integrations/data",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const companyId = req?.currentUser?.companyId;
        if(!companyId) {
          return res.send({message: 'Company id not valid'});
        }
        const { apiName, id, consentIds, applicationId } = req.body;

        const integration = await Integration.findOne({ company: companyId, name: Integrations.trustloop , isActive: true});
        if(!integration){
          throw new BadRequestError("Invalid Integration");
        }
        const integrate = new Trustloop(companyId, integration);
        const dataRecordObject = await DataRecord.findOne({_id: id, isActive: true});
        if(!dataRecordObject) {
          throw new NotFoundError();
        }

        const application = await DataRecord.findById(applicationId);
        if(!application) {
          throw new NotFoundError();
        }
        
        let redirect_url: string = integration.metaFields?.find(mf=>mf.key==='consentRedirectURL')?.value;
        if(application?.objectName ==='Application'){
          //@ts-ignore
          redirect_url = application.fields['redirect_url'];
        } 

        //@ts-ignore
        const consentParams = apiName === 'getAnalytics' ? await createAnalyticsParams(dataRecordObject.fields['Consent'], id ) : await createConsent(dataRecordObject, redirect_url);
        if ('redirect_url' in application.fields) {
          const { redirect_url, ...newFields } = application.fields ?? {};
          application.fields = {
            ...newFields,
            redirect_url_used: redirect_url
          }
          await application.save();
        }
        const data = await integrate.execute(apiName, consentParams, consentIds);
        return res.send(data);
      } catch (error) {
        console.log(error);
        return res.send({message: error});
      }
    }
);

export {router as openBanking};
