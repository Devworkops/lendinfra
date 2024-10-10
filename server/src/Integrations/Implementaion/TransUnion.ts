import axios from "axios";
import { NotFoundError } from "../../errors/not-found-error";
import { getMetaFieldValue } from "../../helper/integrationSetup";
import { DataRecord } from "../../models/data-record";
import { IntegrationDoc } from "../../models/integration";
import { random } from "lodash";
import { Datamodel } from "../../models/data-model";
import { BadRequestError } from "../../errors/bad-request-error";
import { Company } from "../../models/company";
import { ObjectId } from 'mongodb';
import moment from "moment";

export class TransUnion {
    transUnionConfig: IntegrationDoc
    company: string

    constructor(companyId: string, config: IntegrationDoc) {

        this.company = companyId;
        this.transUnionConfig = config;
    }

    async execute(apiName: string, apiParams: { key: string, value: any }[]) {
        switch (apiName) {
            case 'getCreditReport':
                return await this.getCreditReport(apiParams[0].value)
            default:
                return null;
        }
    }

    async getCreditReport(recordId: string) {
        const accountDataRecord = await DataRecord.findById(recordId);
        if (!accountDataRecord) {
            throw new NotFoundError();
        }
        // Get application record
        const companyName = getMetaFieldValue(this.transUnionConfig, 'companyName')
        const userName = getMetaFieldValue(this.transUnionConfig, 'userName')
        const password = getMetaFieldValue(this.transUnionConfig, 'password')
        const baseURL = getMetaFieldValue(this.transUnionConfig, 'baseUrl')
        const uniqueId = random().toString();

        const transUnionDataModel = await Datamodel.findOne({ name: "TransUnion" });
        if (!transUnionDataModel) {
            throw new BadRequestError("Data Model doesn't exist");
        }

        const currentCompany = await Company.findById(this.company);
        if (!currentCompany) {
            throw new BadRequestError("Company doesn't exist");
        }

        const dataRecordFields = accountDataRecord.fields;

        // @ts-ignore
        const salutation = dataRecordFields['Salutation']
        // @ts-ignore
        const first_name = dataRecordFields['FirstName']
        // @ts-ignore
        const last_name = dataRecordFields['LastName']
        // @ts-ignore
        const psu_email = dataRecordFields['Email']
        // @ts-ignore
        const birth_date = this.checkDateFormat(dataRecordFields['DateOfBirth'])
        // @ts-ignore
        const phone_number = dataRecordFields['Phone']
        // @ts-ignore
        const address = dataRecordFields['Address']
        console.log("address-----------------",address)
        const { HouseNumber, Street, TownOrCity } = address;
        let fullAddress = [HouseNumber, Street, TownOrCity]
        .filter(field => field && field.trim() !== '') // Filter out empty or whitespace-only fields
        .join(', ');
        console.log("fullAddress--------------",fullAddress)
        if (fullAddress.length > 50) fullAddress = fullAddress.substring(0, 50);           
        else fullAddress = fullAddress

        var data = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\r\n\t<soap:Header>\r\n\t\t<Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">\r\n\t\t\t<UsernameToken>\r\n\t\t\t\t<!-- credentials will need to be updated -->\r\n\t\t\t\t<Username>${companyName}\\${userName}</Username>\r\n<Password>${password}</Password>\r\n\t\t\t</UsernameToken>\r\n\t\t</Security>\r\n\t</soap:Header>\r\n\t<soap:Body>\r\n\t\t<ns:Search>\r\n\t\t\t<ns:request>\r\n\t\t\t\t<ns:YourReferenceId xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0"></ns:YourReferenceId>\r\n\t\t\t\t<ns:IPAddress>127.0.0.1</ns:IPAddress>\r\n\t\t\t\t<ns:SingleAccessPointWorkflow xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">6</ns:SingleAccessPointWorkflow>\r\n\t\t\t\t<ns:Individuals xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\r\n\t\t\t\t\t<ns:Individual>\r\n\t\t\t\t\t\t<ns:DateOfBirth>${birth_date}</ns:DateOfBirth>\r\n\t\t\t\t\t\t<ns:Names>\r\n\t\t\t\t\t\t\t<ns:Name>\r\n\t\t\t\t\t\t\t\t<ns:Title>${salutation}</ns:Title>\r\n\t\t\t\t\t\t\t\t<ns:GivenName>${first_name}</ns:GivenName>\r\n\t\t\t\t\t\t\t\t<ns:OtherNames/>\r\n\t\t\t\t\t\t\t\t<ns:FamilyName1>${last_name}</ns:FamilyName1>\r\n\t\t\t\t\t\t\t</ns:Name>\r\n\t\t\t\t\t\t</ns:Names>\r\n\t\t\t\t\t\t<ns:Addresses>\r\n\t\t\t\t\t\t\t<ns:Address>\r\n\t\t\t\t\t\t\t\t<ns:Line2></ns:Line2>\r\n\t\t\t\t\t\t\t\t<ns:Line4>${fullAddress}</ns:Line4>\r\n\t\t\t\t\t\t\t\t<ns:Line8></ns:Line8>\r\n\t\t\t\t\t\t\t\t<ns:Line10>${address['Postcode'] || address['PostCode']}</ns:Line10>\r\n\t\t\t\t\t\t\t\t<ns:CountryCode>${address['Country']}</ns:CountryCode>\r\n\t\t\t\t\t\t\t</ns:Address>\r\n\t\t\t\t\t\t</ns:Addresses>\r\n\t\t\t\t\t\t<ns:ApplicationSettings>\r\n\t\t\t\t\t\t\t<ns:HouseholdSearchEnabled>false</ns:HouseholdSearchEnabled>\r\n\t\t\t\t\t\t\t<ns:ThirdPartyOptOut>false</ns:ThirdPartyOptOut>\r\n\t\t\t\t\t\t</ns:ApplicationSettings>\r\n\t\t\t\t\t</ns:Individual>\r\n\t\t\t\t</ns:Individuals>\r\n\t\t\t\t<ProductsToCall xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\r\n                    <CallReport7 DataSets="511">\r\n<Token />\r\n<Score>1</Score>\r\n                   <Purpose>QS</Purpose>\r\n                    </CallReport7>\r\n                </ProductsToCall>\r\n\t\t\t</ns:request>\r\n\t\t</ns:Search>\r\n\t</soap:Body>\r\n</soap:Envelope>\r\n`;
        var config = {
            method: 'post',
            url: `${baseURL}/SingleAccessPoint/Api/v1.0`,
            headers: {
                'Content-Type': 'application/soap+xml',
            },
            data: data
        };

        let fields: { [key: string]: any } = {};
        let creditReportId = '';
        console.log("Request Data:>>>>>>>>>>>>>>>>>>>>", data);

        return await axios(config)
            .then(async function (response) {
                
                var parseString = require('xml2js').parseString;
                console.log("Response Data:>>>>>>>>>>>>>>>>>>>>", response.data);
                const dataRecordCount = await DataRecord.find({
                    objectName: "TransUnion",
                    company:currentCompany
                }).lean().count();
                creditReportId = transUnionDataModel.prefix + ' ' + (dataRecordCount + 1);
                parseString(response.data, function (_err: any, transUnionResult: any) {
                    console.log("Response Data JSON format------------------>>>>>>>>>>>>>>>>>>>>:", JSON.stringify(transUnionResult, null, 2));

                    let credScore = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].creditscores[0].creditscore[0].score[0]._;
                    let creditScore = credScore ? Number(credScore) : 0

                    let summary = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditrequest[0].applicant[0];
                    let type = 'Indivisual Report';
                    let nameObj = summary.name[0];
                    const title = nameObj.title[0] || '';
                    const forename = nameObj.forename[0] || '';
                    const surname = nameObj.surname[0] || '';
                    const fullName = `${title} ${forename} ${surname}`.trim();
                    let dob = summary.dob[0] || '';
                    let address = summary.address[0].street1[0] || '';

                    let financialAccountSummary = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].share[0];
                    let totalFinancialAccounts = Number(financialAccountSummary.totalactiveaccs?.[0]) || 0;
                    let wrostPaymentIn12Months = financialAccountSummary.worsepaystatus12months?.[0] || '';
                    let wrostPaymentIn36Months = financialAccountSummary.worsepaystatus36months?.[0] || '';
                    let defaultsInLast36Months = Number(financialAccountSummary.totaldefaults36months?.[0]) || 0;

                    let searches = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].searches[0];
                    let totalSearches3Months = searches.totalsearches3months?.[0] ? Number(searches.totalsearches3months[0]) : 0
                    let totalSearches12Months = searches.totalsearches12months?.[0] ? Number(searches.totalsearches3months[0]) : 0
                    let totalHomeCreditSearches3Months = searches.totalhomecreditsearches3months?.[0] ? Number(searches.totalhomecreditsearches3months[0]) : 0

                    let judgments = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].judgments[0];
                    let totalActive = judgments.totalactive?.[0] ? Number(judgments.totalactive[0]) : 0;
                    let totalSatisfied = judgments.totalsatisfied?.[0] ? Number(judgments.totalsatisfied[0]) : 0;
                    let totalActiveAmount = judgments.totalactiveamount?.[0] ? Number(judgments.totalactiveamount?.[0]) : 0;

                    let bais = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].bais[0];
                    let currentlyInsolvent = bais.currentlyinsolvent?.[0] ? Number(bais.currentlyinsolvent[0]) : 0;
                    let totalDischarged = bais.totaldischarged?.[0] ? Number(bais.totaldischarged[0]) : 0;

                    let notices = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].notices[0];
                    let nocFlag = notices.nocflag?.[0] ? Number(notices.nocflag[0]) : 0;
                    let totalDisputes = notices.totaldisputes?.[0] ? Number(notices.totaldisputes[0]) : 0;
                    
                    let electoralRoll = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].addressconfs[0].addressconf || '';
                    let totalAddress = electoralRoll ? electoralRoll.length : 0;
                    
                    let linksAssociatesAliases = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].summary[0].links[0];
                    let addressLink = Number(linksAssociatesAliases.totalundecaddressesunsearched?.[0]) || 0;
                    let associates = Number(linksAssociatesAliases.totalundecassociates?.[0]) || 0;
                    let aliases = Number(linksAssociatesAliases.totalundecaliases?.[0]) || 0;

                    let countryCourtJudgments = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].judgments || '';
                    let courtJudgments=''
                    if(countryCourtJudgments && countryCourtJudgments !=''){
                        courtJudgments = countryCourtJudgments[0].judgment
                    }

                    let searchHistory = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].searches || '';
                    let searchHistoryArray = ''
                    if(searchHistory && searchHistory !=''){
                        searchHistoryArray = searchHistory[0].search
                    }

                    let addressArray = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].addresslinks || '';
                    let addressLinks  = ''
                    if(addressArray && addressArray != ''){
                        addressLinks = addressArray?.[0].addresses?.[0].address
                    }
                    
                    let associateArray = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].associatelinks || '';
                    let associateLinks  = ''
                    if(addressArray && addressArray != ''){
                        associateLinks = associateArray?.[0].associatelink || ''
                    }
                    
                    let aliasesArray = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].aliaslinks || '';
                    let aliasesLinks  = ''
                    if(aliasesArray && aliasesArray != ''){
                        aliasesLinks = aliasesArray?.[0].aliaslink || ''
                    }
                    
                    let financialAccountsArray = transUnionResult['s:Envelope']['s:Body'][0].SearchResponse[0].SearchResult[0].ProductResponses[0].CallReport7[0].CallReport7Response[0].Response[0].creditreport[0].applicant[0].accs || '';
                    let financialAccounts  = ''
                    if(financialAccountsArray && financialAccountsArray != ''){
                        financialAccounts = financialAccountsArray?.[0].acc || ''
                    }
                    let cifasWarning = 0
                    let correctionNotice = ''
                    let bankruptciesInsolvencies = ''

                    let lastSyncedDate = new Date().toISOString();
                    fields = {
                        creditReport: {
                            summary:{
                                type,
                                fullName,
                                dob,
                                address
                            },
                            financialAccountSummary:{
                                totalFinancialAccounts,
                                wrostPaymentIn12Months,
                                wrostPaymentIn36Months,
                                defaultsInLast36Months
                            },
                            searches: {
                                totalSearches3Months,
                                totalSearches12Months,
                                totalHomeCreditSearches3Months
                            },
                            judgments: {
                                totalActive,
                                totalSatisfied,
                                totalActiveAmount
                            },
                            publicInformation: {
                                totalDischarged,
                                currentlyInsolvent
                            },
                            correctionAndDisputeNotices: {
                                nocFlag,
                                totalDisputes
                            },
                            electoralRoll: {
                                totalAddress,
                                electoralRoll
                            },
                            linksAssociatesAliases: {
                                addressLink,
                                associates,
                                aliases
                            },
                            cifasWarnings:{
                                cifasWarning
                            },
                            NoticeOfCorrection:{
                                correctionNotice
                            },
                            bankruptciesInsolvencies:{
                                bankruptciesInsolvencies
                            },
                            countryCourtJudgments:{
                                courtJudgments
                            },
                            searchHistory:{
                                searchHistoryArray
                            },
                            addressLink:{
                                addressLinks
                            },
                            associateLinks:{
                                associateLinks
                            },
                            aliasesLinks:{
                                aliasesLinks
                            },
                            financialAccounts:{
                                financialAccounts
                            },
                            creditScore: creditScore,
                            account: recordId,
                            lastSyncedDate: lastSyncedDate,
                            response: transUnionResult
                        }
                    }
                });
                const dataRecord = DataRecord.build({
                    _id: new ObjectId(),
                    objectName: "TransUnion",
                    uniqueId: uniqueId,
                    primaryKey: recordId,
                    secondaryKey: "",
                    dataModel: transUnionDataModel.id,
                    company: currentCompany.id,
                    createdBy: accountDataRecord.createdBy,
                    fields: fields,
                    recordId: creditReportId
                });

                await dataRecord.save();
                if (dataRecord._id) {
                    accountDataRecord.fields = { ...accountDataRecord.fields, TransUnion: dataRecord._id };
                    await accountDataRecord.save();
                }

                return dataRecord;
            })
            .catch(function (error) {
                console.log("TransUnion error---------------------------",error);
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

    async getAuthToken(): Promise<string | undefined> {
        const companyName = getMetaFieldValue(this.transUnionConfig, 'companyName')
        const username = getMetaFieldValue(this.transUnionConfig, 'userName')
        const password = getMetaFieldValue(this.transUnionConfig, 'password')

        let data = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\n    <soap:Header>\n        <Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">\n            <UsernameToken>\n                <!-- credentials will need to be updated -->\n                <Username>${companyName}\\${username}</Username>\n                <Password>${password}</Password>\n            </UsernameToken>\n        </Security>\n    </soap:Header>\n    <soap:Body>\n        <ns:Search>\n            <ns:request>\n                <ns:YourReferenceId xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0"></ns:YourReferenceId>\n                <ns:SingleAccessPointWorkflow xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">6</ns:SingleAccessPointWorkflow>\n                <ns:Individuals xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\n                    <ns:Individual>\n                        <ns:DateOfBirth>1968-05-05</ns:DateOfBirth>\n                        <ns:Names>\n                            <ns:Name>\n                                <ns:Title>Mr</ns:Title>\n                                <ns:GivenName>John</ns:GivenName>\n                                <ns:OtherNames/>\n                                <ns:FamilyName1>Ferrari</ns:FamilyName1>\n                            </ns:Name>\n                        </ns:Names>\n                        <ns:Addresses>\n                            <ns:Address>\n                                <ns:Line2>17</ns:Line2>\n                                <ns:Line4></ns:Line4>\n                                <ns:Line8></ns:Line8>\n                                <ns:Line10>X9 9LF</ns:Line10>\n                                <ns:CountryCode>EN</ns:CountryCode>\n                            </ns:Address>\n                        </ns:Addresses>\n                        <ns:ApplicationSettings>\n                            <ns:HouseholdSearchEnabled>false</ns:HouseholdSearchEnabled>\n                            <ns:ThirdPartyOptOut>false</ns:ThirdPartyOptOut>\n                        </ns:ApplicationSettings>\n                    </ns:Individual>\n                </ns:Individuals>\n                <ProductsToCall xmlns="http://www.callcredit.co.uk/SingleAccessPointService/ISingleAccessPointService/1.0">\n                    <CallReport7 DataSets="511">\n                    <Token />\n                    <Score>1</Score>\n                    <Purpose>QS</Purpose>\n                    </CallReport7>\n                </ProductsToCall>\n            </ns:request>\n        </ns:Search>\n    </soap:Body>\n</soap:Envelope>`;

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.callcreditsecure.co.uk/SingleAccessPoint/Api/v1.0',
            headers: {
                'Content-Type': 'application/xml',
                'Cookie': 'f5_cspm=1234; __cf_bm=wo242wHcTXIoZwK0VfSGk6x8.NSXpZvsZfE8H4V2Zlw-1706270161-1-Aajr5JD16ZvEZyvYdbha2B+Q55A1kN0inO73X67n9FzUWyb7Kez+pNF6QzIkf6DaweFiYiwHx00UCcB6N2tvPWE='
            },
            data: data
        };

        const res = axios.request(config)
            .then((response) => {
                if (response.status === 200) return 'Success'
                else return undefined
            })
            .catch((error) => {
                console.log("Failed to get transunion authorization token!");
                return undefined
            });

        return res;
    }

    checkDateFormat(date: string) {
        let dob = date.split('T')[0]
        const formats = [
            'YYYY/MM/DD',
            'YYYY/DD/MM',
            'DD/MM/YYYY',
            'MM/DD/YYYY',
            'YYYY-MM-DD',
            'YYYY-DD-MM',
            'DD-MM-YYYY',
            'MM-DD-YYYY',
        ];
        const parsedDate = moment(dob, formats, true);
        if (!parsedDate.isValid()) {
            console.error('Invalid date:---------------------', dob);
            return 'Invalid date format'; // Handle invalid date as needed
        }
        return parsedDate.format('YYYY-MM-DD');
    }
}
