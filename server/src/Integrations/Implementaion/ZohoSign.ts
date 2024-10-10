import axios, { AxiosInstance } from "axios";
import { getMetaFieldValue } from "../../helper/integrationSetup";
import { IntegrationDoc } from "../../models/integration";
import { DataRecordDoc } from "../../models/data-record";

export class ZohoSign {
    httpClient: AxiosInstance;
    zohoSignConfig: IntegrationDoc
    company: any

    constructor(companyId: string, config: IntegrationDoc) {

        this.company = companyId;
        this.zohoSignConfig = config;

        this.httpClient = axios.create({
            baseURL: getMetaFieldValue(this.zohoSignConfig, 'redirectUri'),
        });

        this.httpClient.interceptors.request.use(
            async (config) => {
                const authToken = await this.getAuthToken();
                config.headers['Authorization'] = `Bearer ${authToken}`;
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    async execute(apiName: string, userDataRecord: DataRecordDoc | null, contract: DataRecordDoc | null) {
        switch (apiName) {
            case 'sendDoc':
                return await this.sendZohoDoc(userDataRecord, contract);
            default:
                return null;
        }
    }

    async getAuthToken() {
        const refreshToken = getMetaFieldValue(this.zohoSignConfig, 'refreshToken')
        const clientId = getMetaFieldValue(this.zohoSignConfig, 'clientId')
        const clientSecret = getMetaFieldValue(this.zohoSignConfig, 'clientSecret')
        const redirectUri = getMetaFieldValue(this.zohoSignConfig, 'redirectUri')
        const baseUrl = getMetaFieldValue(this.zohoSignConfig, 'baseUrl')
        const grantType = 'refresh_token';
        const authTokenURL = `?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=${grantType}`;

        const { data } = await axios.post(
            `${baseUrl}/oauth/v2/token${authTokenURL}`
        );

        if (data?.access_token) {
            return data.access_token;
        } else {
            console.log("Failed to get Zoho Sign authorization token!");
            return undefined
        }
    }

    async sendZohoDoc(userDataRecord: any, contract: any) {
        // Template data will be filled after the template doc is finalised
        // Currenlty Template data is dummy 
        const requestBody = {
            templates: {
                field_data: {
                    field_text_data: {
                        "name": `Mr/Mrs/Miss ${userDataRecord?.fields?.FirstName} ${userDataRecord?.fields?.LastName}`,
                        "dir": `${contract?.fields?.['DailyRate']}%`,
                        "tfl": contract?.fields?.['FacilityAmount'],
                        "roi": contract?.fields?.['DailyRate'],
                        "apr": contract?.fields?.['APR'],
                        "Quidfair": "Quidfair"
                    },
                    field_boolean_data: {},
                    field_date_data: {},
                    field_radio_data: {},
                },
                actions: [
                    {
                        recipient_name: `${userDataRecord?.fields?.FirstName} ${userDataRecord?.fields?.LastName}`,
                        recipient_email: userDataRecord?.fields?.Email,
                        action_id: "54488000000031062",
                        signing_order: 1,
                        role: "Client",
                        verify_recipient: false,
                        private_notes: "",
                    },
                ],
                notes: "",
            },
        };

        try {
            // 54488000000031041, Semi finalised template
            const { data } = await this.httpClient.post(
                `/api/v1/templates/54488000000031041/createdocument`,
                requestBody
            );
            return data;

        } catch (error: any) {
            console.error(error);
            throw new Error("Failed to send Zoho document");
        }
    }

}
