import { IntegrationDoc, Integrations, IntegrationType } from "../models/integration";

export const getAvailableIntegrationSetup = async (integrations: IntegrationDoc[], company: string) => {
  const mapOfIntegrationSetup = new Map<string, any>();

  const availableIntegrations = [];

  for (const integration of integrations) {
    mapOfIntegrationSetup.set(integration.name, integration);
  }

  const environment = process.env.ENVIRONMENT || "dev"

  let redirectUrl = 'http://localhost:3006/integration/callback';

  if (environment == "dev") {
    redirectUrl = 'https://app.qa.lendinfra.com/integration/callback'
  }
  else if (environment == "stage") {
    redirectUrl = 'https://app.stage.lendinfra.com/integration/callback'
  }
  else if (environment == "live") {
    redirectUrl = 'https://app.lendinfra.com/integration/callback'
  }

  const allIntegrations  = [];

  let trustloopBaseUrl = environment == 'live' ? "https://external.trustloop.io" : "https://external.qa.open-banking-gateway.com";
  const trustloopIntegration = ({
    name: Integrations.trustloop,
    description: "TrustLoop provides instant open banking solutions in one place",
    company,
    logo: "/trustloop.png",
      type: IntegrationType.api,
      isActive: true,
      isVisible: true,
      actions: [
        { id: 'getConsents', label: 'Get Consents', },
        { id: 'getTransactions', label: 'Get Transactions' },
        { id: 'getAnalytics', label: 'Get Analytics' },
        { id: 'createConsent', label: 'Create Consent' },
        { id: 'getandUpdateConsent', label: 'Get and update consent status' },
        { id: 'refetchData', label: 'Refetch Trustloop data' }
      ],
      metaFields: [{ key: "baseUrl", label: "Base URL", value: trustloopBaseUrl, type: "string", isEditable: false, isVisible: false },
      { key: "redirectUrl", label: "Redirect URL", value: redirectUrl, type: "string", isEditable: false, isVisible: false },
      { key: "accessTokenURL", label: "Access Token URL", value: `${trustloopBaseUrl}/token`, type: "string", isEditable: false, isVisible: false },
      { key: "clientId", label: "Client ID", value: "", type: "string", isEditable: true, isVisible: true },
      { key: "clientSecret", label: "Client Secret", value: "", type: "password", isEditable: true, isVisible: true },
      { key: "consentRedirectURL", label: "Consent Redirect URL", value: "", type: "string", isEditable: true, isVisible: true },
    ],
  });
  allIntegrations.push(trustloopIntegration)
  if (!mapOfIntegrationSetup.has(Integrations.trustloop)) {
    availableIntegrations.push(trustloopIntegration)
  }

  let transUnionBaseUrl = environment == 'live' ? "https://www.callcreditsecure.co.uk" : "https://www.callcreditsecure.co.uk";
  const transunionIntegration = ({
    name: Integrations.transUnion,
    description: "Transunion offers total credit protection all in one place from credit score, credit report and credit alert.",
    company,
    logo: "/TransUnion.png",
    type: IntegrationType.api,
    isActive: true,
    isVisible: true,
    actions: [
      { id: 'getCreditReport', label: 'Get Credit Report', },
    ],
    metaFields: [{ key: "baseUrl", label: "Base URL", value: transUnionBaseUrl, type: "string", isEditable: false, isVisible: false },
    { key: "redirectUrl", label: "Redirect URL", value: redirectUrl, type: "string", isEditable: false, isVisible: false },
    { key: "accessTokenURL", label: "Access Token URL", value: `${transUnionBaseUrl}/SingleAccessPointAdmin/Api/v1.0`, type: "string", isEditable: false, isVisible: false },
    { key: "companyName", label: "Comapny Name", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "userName", label: "User Name", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "password", label: "Password", value: "", type: "password", isEditable: true, isVisible: true },
    ],
  });
  allIntegrations.push(transunionIntegration)
  if (!mapOfIntegrationSetup.has(Integrations.transUnion)) {
    availableIntegrations.push(transunionIntegration)
  }
  
  let zohoUrl = environment == 'live' ? "https://sign.zoho.com" : "https://sign.zoho.com";
  const zohoIntegration = ({
    name: Integrations.zoho,
    description: "Zoho sign provides the feature of digital signatures on documents.",
    company,
    logo: "/Zoho.png",
    type: IntegrationType.api,
    isActive: true,
    isVisible: true,
    actions: [
      { id: 'sendDoc', label: 'Send document for Sign', },
    ],
    metaFields: [{ key: "baseUrl", label: "Base URL", value: 'https://accounts.zoho.com', type: "string", isEditable: false, isVisible: false },
    { key: "redirectUri", label: "Redirect URI", value: zohoUrl, type: "string", isEditable: false, isVisible: false },
    { key: "refreshToken", label: "Refresh Token", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "clientId", label: "Client ID", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "clientSecret", label: "Client Secret", value: "", type: "password", isEditable: true, isVisible: true },
    ],
  });
  allIntegrations.push(zohoIntegration);
  if (!mapOfIntegrationSetup.has(Integrations.zoho)) {
    availableIntegrations.push(zohoIntegration);
  }

  let twilioURL = environment == 'live' ? "https://studio.twilio.com" : "https://studio.twilio.com";
  const twilioIntegration = {
    name: Integrations.twilio,
    description: "Twilio helps to send automated messages to whatsapp.",
    company,
    logo: "/twilio.png",
    type: IntegrationType.api,
    isActive: true,
    isVisible: true,
    actions: [
      { id: 'startStudioFlowForZohoSign' , label: 'Triggers the Twilio studio flow',},
    ],
    metaFields: [{ key: "baseUrl", label: "Base URL", value: twilioURL, type: "string", isEditable: false, isVisible: false },
    { key: "Account SID", label: "Account SID", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "Auth token", label: "Auth token", value: "", type: "password", isEditable: true, isVisible: true },
    ],
  };
  allIntegrations.push(twilioIntegration);
  if (!mapOfIntegrationSetup.has(Integrations.twilio)) {
    availableIntegrations.push(twilioIntegration);
  }

  let lendXPBaseUrl = environment == 'live' ? "https://dev.cambrianfunding.co.uk/WH/CaptureLendInfra.ashx" : "https://dev.cambrianfunding.co.uk/WH/CaptureLendInfra.ashx";
  const lendXPIntegration = ({
    name: Integrations.lendXP,
    description: "Offer fair and affordable loans to meet your individual requirements",
    company,
    logo: "",
    type: IntegrationType.api,
    isActive: true,
    isVisible: true,
    actions: [
      { id: 'getSignature', label: 'Get Signature', },
    ],
    metaFields: [{ key: "baseUrl", label: "Base URL", value: lendXPBaseUrl, type: "string", isEditable: false, isVisible: false },
    { key: "redirectUrl", label: "Redirect URL", value: redirectUrl, type: "string", isEditable: false, isVisible: false },
    { key: "url", label: "Url", value: "", type: "string", isEditable: true, isVisible: true },
    { key: "signature", label: "Signature", value: "", type: "string", isEditable: true, isVisible: true },
    ],
  });
  allIntegrations.push(lendXPIntegration)
  if (!mapOfIntegrationSetup.has(Integrations.lendXP)) {
    availableIntegrations.push(lendXPIntegration)
  }

  return {availableIntegrations, allIntegrations};
};

export const getMetaFieldValue = (integration: IntegrationDoc, key: string) => {
  if (integration && integration.metaFields && integration.metaFields.length > 0) {
    const metaField = integration.metaFields?.find((attr) => {
      return attr.key == key;
    });

    if (metaField) {
      return metaField.value;
    } else {
      return "";
    }
  }
  return "";
};
