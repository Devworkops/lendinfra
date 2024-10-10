import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getMetaFieldValue } from "../../helper/integrationSetup";
import { IntegrationDoc } from "../../models/integration";
import {
    TrustlooopNewConsentRequestParams,
    TrustlooopNewConsentRequestResponse,
    TrustLoopAnalyticsResponse,
    TrustloopGetAnalyticsRequest,
    TrustloopGetAuthTokenResposne,
    TrustloopGetConsentByIdResponse,
    TrustloopGetTransactionResponse,
    TrustloopGetTransactionsQueryParams
} from "../Interface/ITrustloop";
import { DataRecord, DataRecordDoc } from "../../models/data-record";
import { random } from "lodash";
import { Datamodel } from "../../models/data-model";
import { BadRequestError } from "../../errors/bad-request-error";
import { Company } from "../../models/company";
import { NotFoundError } from "../../errors/not-found-error";

export class Trustloop {
    httpClient: AxiosInstance;
    trustLoopConfig: IntegrationDoc
    company: string

    constructor(companyId: string, config: IntegrationDoc) {

        this.company = companyId;
        this.trustLoopConfig = config;

        this.httpClient = axios.create({
            baseURL: getMetaFieldValue(this.trustLoopConfig, 'baseUrl'),
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

    async execute(apiName: string, apiParams: { key: string, value: any }[], consentIds?: string[] ) {
        console.log("Into Trustloop execute------------------",apiName, apiParams, consentIds)

        switch (apiName) {
            case 'getConsent':
                console.log("Into getconsent------------------",consentIds)
                return await this.getConsent(consentIds);
            case 'getandUpdateConsent':
                console.log("Into getandUpdateConsent------------------",consentIds)
                const latestConsents = await this.getConsent(consentIds);
                console.log("latestConsents------------------",latestConsents)
                if (latestConsents) {
                    console.log("latestConsents exist------------------",latestConsents)
                    return await this.updateConsents(latestConsents);
                }
            case 'refetchData': 
            console.log("into refetchData------------------",consentIds)
                if (!consentIds || consentIds.length === 0) {
                    throw new Error('At least one consentId is required for refetchData');
                }
                return await this.refetchData(consentIds[0]);
            case 'getConsents':
                console.log("Into getConsents------------------")
                return await this.getConsents()
            case 'getTransactions':
                let recordID = apiParams.find((param) => {
                    return param.key == 'recordId'
                })

                let consentID = apiParams.find((param) => {
                    return param.key == 'consentId'
                })

                let params = apiParams.find((param) => {
                    return param.key == 'body'
                })

                if (recordID && consentID) {
                    return await this.getTransactions(consentID.value, params?.value);
                }
                else
                    return null
            case 'getAnalytics':
                let analyticsRecord = apiParams.find((param) => {
                    return param.key == 'recordId'
                })
                let analyticsConsentID = apiParams.find((param) => {
                    return param.key == 'consentId'
                })
                let analyticsBody = apiParams.find((param) => {
                    return param.key == 'body'
                })
                const analyticsResponse = await this.getAnalytics(analyticsConsentID?.value, analyticsBody?.value, analyticsRecord?.value);
                console.log("into getAnalytics-------------------------",analyticsResponse)
                return analyticsResponse;
            case 'createConsent':
                let consentRecord = apiParams.find((param) => {
                    return param.key == 'recordId'
                })
                let consentParams = apiParams.find((param) => {
                    return param.key == 'body'
                })
                return await this.createConsent(consentParams?.value, consentRecord?.value);
            default:
                return null;
        }
    }

    async getAuthToken() {

        const clientId = getMetaFieldValue(this.trustLoopConfig, 'clientId')
        const clientSecret = getMetaFieldValue(this.trustLoopConfig, 'clientSecret')
        const baseUrl = getMetaFieldValue(this.trustLoopConfig, 'baseUrl')

        try {
            const { data } = await axios.post<TrustloopGetAuthTokenResposne>(
                `${baseUrl}/token`,
                {},
                {
                    auth: {
                        username: clientId,
                        password: clientSecret,
                    },
                }
            );

            if (data?.access_token) {
                return data.access_token;
            } else {
                console.log("error no access token")
                throw new Error("Failed to get trustloop authorization token!");

            }
        } catch (error) {
            return undefined
        }
    }

    async getConsents() {
        try {
            const { data } = await this.httpClient.post("/consents", {});
            console.log("Into getConsents method------------------",data)
            return data.consents;
        } catch (error: any) {
            let errorResult: any = { message: error.message, stack: error.stack };
            if (error.response && error.response.data) {
                errorResult = {
                    ...errorResult,
                    Reason: error.response.data,
                };
            }
            return errorResult;
        }
    }

    async getConsent(ids: string[] | undefined) {
        if (!ids) return [];
        try {
            const consents: any[] = await Promise.all(ids.map(async (id) => {
                console.log("Into getConsent method------------------")
                const response = await this.httpClient.get(`/consents/${id}`);
                console.log("response getConsent------------------",response)

                return response.data.consent;
            }));
            return consents;
        } catch (error: any) {
            let errorResult: any = { message: error.message, stack: error.stack };
            if (error.response && error.response.data) {
                errorResult = {
                    ...errorResult,
                    Reason: error.response.data,
                };
            }
            return errorResult;
        }
    }    

    async updateConsents(latestConsents: any[]) {
        console.log("into updateConsents-------------------------",latestConsents)

        try {
            const updatedConsents = await Promise.all(latestConsents.map(async (consent: any) => {
                const consentRecord: DataRecordDoc | null = await DataRecord.findOne({'fields.consent_id': consent.id})
                if(consentRecord) {
                    // @ts-ignore
                    consentRecord.fields['status'] = consent['status'];
                    // @ts-ignore
                    consentRecord.fields['bank'] = consent['bank']
                    await DataRecord.findByIdAndUpdate(consentRecord.id, consentRecord)
                    return consentRecord;
                }
                return null;
            }))
            return updatedConsents;
        } catch (error: any) {
            let errorResult: any = { message: error.message, stack: error.stack };
            if (error.response && error.response.data) {
                errorResult = {
                    ...errorResult,
                    Reason: error.response.data,
                };
            }
            return errorResult;
        }
    }

    async getTransactions(
        consentId: string,
        params: Partial<TrustloopGetTransactionsQueryParams> = {}
    ) {
        console.log("getTransactions------------------",consentId)
        try {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join("&");
            const { data } = await this.httpClient.get<TrustloopGetTransactionResponse>(
                `/consent/${consentId}/transactions?${queryString}`
            );
            console.log("queryString------------------",queryString)
            console.log("getTransactions data------------------",data)

            return data;
        } catch (error: any) {
            let errorResult: any = { message: error.message, stack: error.stack };
            if (error.response && error.response.data) {
                errorResult = {
                    ...errorResult,
                    Reason: error.response.data,
                };
            }
            return errorResult;
        }
    }

    async getConsentConfirmationLink(params: TrustlooopNewConsentRequestParams) {
        const { data } = await this.httpClient.post<
            unknown,
            AxiosResponse<TrustlooopNewConsentRequestResponse>,
            TrustlooopNewConsentRequestParams
        >("/consent/add", params);
        return data;
    }

    async getConsentById(consentId: string) {
        const { data } = await this.httpClient.get<TrustloopGetConsentByIdResponse>(
            `/consents/${consentId}`
        );
        return data;
    }

    async createConsent(params: TrustlooopNewConsentRequestParams, recordId: string) {
        console.log("into createConsent-------------------------",params, "recordId----------------",recordId)
        let uniqueId;
        let fields: { [key: string]: any } = {};
        const consentDataModel = await Datamodel.findOne({ name: "Consent", company: this.company });
        if (!consentDataModel) {
            throw new BadRequestError("Data Model doesn't exist");
        }
        const currentCompany = await Company.findById(this.company);
        if (!currentCompany) {
            throw new BadRequestError("Company doesn't exist");
        }
        const dataRecord = await DataRecord.findById(recordId);
        if (!dataRecord) {
            throw new NotFoundError();
        }
        return await this.httpClient.post<
            unknown,
            AxiosResponse<TrustlooopNewConsentRequestResponse>,
            TrustlooopNewConsentRequestParams
        >(`/consent/add`, params)
            .then(async function (response) {
                console.log("response*****************",response.data)
                const environment = process.env.ENVIRONMENT || "dev";
                const baseURL= environment === 'live' ? `https://customer.trustloop.io` : `https://customer.qa.open-banking-gateway.com`;
                const link = `${baseURL}/identity_check/report/${response.data.consent_id}/summary`;
                fields = { ...response.data, account: recordId, status: 'pending', bank: 'n/a', link: link }
                console.log("******CONSENT DETAILS******\n", fields, "\n******DataRecord Details******\n", dataRecord);
                const consentRecordCount = await DataRecord.find({ objectName: "Consent", company: currentCompany }).lean().count();
                let consentRecordId = consentDataModel.prefix + ' ' + (consentRecordCount + 1);
                uniqueId = consentRecordCount + 1;
                const consentRecord = DataRecord.build({
                    objectName: "Consent",
                    uniqueId: uniqueId.toString(),
                    primaryKey: recordId,
                    secondaryKey: "",
                    dataModel: consentDataModel.id,
                    company: currentCompany.id,
                    createdBy: dataRecord.createdBy,
                    fields: fields,
                    recordId: consentRecordId
                });

                await consentRecord.save();
                if (consentRecord._id) {
                    console.log("consentRecord Id------------",consentRecord._id)
                    const objectName = dataRecord.objectName.toString().toLowerCase();
                    if (objectName.includes("account")) {
                        dataRecord.fields = { ...dataRecord.fields, Consent: consentRecord._id };
                    }
                    else {
                        let applicationFields = dataRecord.fields;
                        // @ts-ignore
                        let accountID = applicationFields['IndividualAccount'];
                        let accountDataRecord = await DataRecord.findById(accountID);
                        if (!accountDataRecord) {
                            throw new BadRequestError("Record ID not found");
                        }
                        accountDataRecord.fields = { ...accountDataRecord.fields, Consent: consentRecord._id };
                        await accountDataRecord.save();
                    }
                    await dataRecord.save();
                }
                console.log("consentRecord-------------",consentRecord)
                return consentRecord;
            })
            .catch(function (error) {
                console.log("**ERROR**\n", error);
                let errorResult: any = {message: error.message, stack: error.stack}
                if (error.response && error.response.data) {
                    errorResult= {
                        ...errorResult,
                        Reason: error.response.data, 
                    }
                }
                return errorResult;
            });
    }

    async getAnalytics(consentID: string, params: TrustloopGetAnalyticsRequest, recordId: string) {
        console.log("into getAnalytics----------------------------",params, "recordId-------------------",recordId, "consentID--------------",consentID)
        let fields: { [key: string]: any } = {};
        const uniqueId = random().toString();
        const trustLoopDataModel = await Datamodel.findOne({ name: "TrustLoop", company: this.company });
        if (!trustLoopDataModel) {
            throw new BadRequestError("Data Model doesn't exist");
        }
        const currentCompany = await Company.findById(this.company);
        if (!currentCompany) {
            throw new BadRequestError("Company doesn't exist");
        }
        const accountDataRecord = await DataRecord.findById(recordId);
        if (!accountDataRecord) {
            throw new NotFoundError();
        }
        return await this.httpClient.post<
            unknown,
            AxiosResponse<TrustLoopAnalyticsResponse>,
            TrustloopGetAnalyticsRequest>(
                `/consents/${consentID}/analytics`, params)
            .then(async function (response) {
                fields = { ...response.data, account: recordId }
                // find all the record
                const dataRecordCount = await DataRecord.find({ objectName: "TrustLoop", company: currentCompany }).lean().count();
                let analyticRecordId = trustLoopDataModel.prefix + ' ' + (dataRecordCount + 1);
                const dataRecord = DataRecord.build({
                    objectName: "TrustLoop",
                    uniqueId: uniqueId,
                    primaryKey: recordId,
                    secondaryKey: "",
                    dataModel: trustLoopDataModel.id,
                    company: currentCompany.id,
                    createdBy: accountDataRecord.createdBy,
                    fields: fields,
                    recordId: analyticRecordId
                });

                await dataRecord.save();
                if (dataRecord._id) {
                    accountDataRecord.fields = { ...accountDataRecord.fields, TrustLoop: dataRecord._id };
                    await accountDataRecord.save();
                }
                return dataRecord;
            })
            .catch(function (error) {
                console.log(error);
                let errorResult: any = {message: error.message, stack: error.stack}
                if (error.response && error.response.data) {
                    errorResult= {
                        ...errorResult,
                        Reason: error.response.data, 
                    }
                }
                return errorResult;
            });
    }

    async refetchData(consentId: string) {
        console.log("into refetchData method------------------",consentId)
        const currentCompany = await Company.findById(this.company);
        if (!currentCompany)
            throw new BadRequestError("Company doesn't exist");
    
        const trustloopData = await DataRecord.findOne({ objectName: "TrustLoop", company: this.company, 'fields.consent_id': consentId });
        console.log("trustloopData------------------",trustloopData)

        if (!trustloopData)
            throw new BadRequestError("TrustLoop data record doesn't exist");
    
        const refetchResponse = await this.httpClient.post<
            unknown,
            AxiosResponse<TrustLoopAnalyticsResponse>,
            { consent_id: string }
        >(`/consent/refetch`, { consent_id: consentId });
        console.log("refetchResponse------------------",refetchResponse)

        if (refetchResponse.status !== 200) 
            throw new Error(`Failed to refetch data: ${refetchResponse.statusText}`);
        
        const params = {
            blocks: [
            "overview",
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
        };
    
        const analyticsResponse = await this.httpClient.post<
            unknown,
            AxiosResponse<TrustLoopAnalyticsResponse>,
            TrustloopGetAnalyticsRequest
        >(`/consents/${consentId}/analytics`, params);
        if (analyticsResponse.status !== 200) {
            throw new Error(`Failed to retrieve analytics: ${analyticsResponse.statusText}`);
        }
    
        trustloopData.fields = {
            ...trustloopData.fields,
            ...analyticsResponse.data,
        }
        return await trustloopData.save();
    }
}
