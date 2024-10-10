import express, { Express, Request, Response , NextFunction} from "express";
import bodyParser, { json } from 'body-parser';
import cookieSession from "cookie-session";
import { NotFoundError } from "./errors/not-found-error";
import {allRulesRouter} from "./routes/rule/all";
import {deleteRuleRouter} from "./routes/rule/delete";
import {createRuleRouter} from "./routes/rule/new";
import {showRuleDetailRouter} from "./routes/rule/show";
import {updateRuleRouter} from "./routes/rule/update";
import {allRuleSetRouter} from "./routes/rule-set/all";
import {deleteRuleSetRouter} from "./routes/rule-set/delete";
import {createRuleSetRouter} from "./routes/rule-set/new";
import {showRuleSetDetailRouter} from "./routes/rule-set/show";
import {updateRuleSetRouter} from "./routes/rule-set/update";
import {allRuleActionRouter} from "./routes/rule-action/all";
import {deleteRuleActionRouter} from "./routes/rule-action/delete";
import {createRuleActionRouter} from "./routes/rule-action/new";
import {showRuleActionDetailRouter} from "./routes/rule-action/show";
import {updateRuleActionRouter} from "./routes/rule-action/update";
import {executeRuleActionRouter} from "./routes/rule-action/execute";
import { errorHandler } from "./middleware/error-handler";
import { allWorkflowsRouter } from "./routes/workflow/all";
import { deleteWorkflowRouter } from "./routes/workflow/delete";
import { createWorkflowRouter } from "./routes/workflow/new";
import { showWorkflowDetailRouter } from "./routes/workflow/show";
import { updateWorkflowRouter } from "./routes/workflow/update";
import { allworkflowStepRouter } from "./routes/workflow-step/all";
import { deleteWorkflowStepRouter } from "./routes/workflow-step/delete";
import { createWorkflowStepRouter } from "./routes/workflow-step/new";
import { showWorkflowStepDetailRouter } from "./routes/workflow-step/show";
import { updateWorkflowStepRouter } from "./routes/workflow-step/update";
import {signinRouter} from "./routes/authentication/signin";
import {signoutRouter} from "./routes/authentication/signout";
import {signupRouter} from "./routes/authentication/signup";
import {updateRolesRouter} from "./routes/authentication/updateRoles";
import {updateUserInfoRouter} from "./routes/authentication/updateUser";
import {resetPasswordRouter} from "./routes/authentication/resetPassword";
import {currentUserRouter} from "./routes/authentication/currentUser";
import {deleteUserRouter} from "./routes/authentication/deleteUser";
import {resetPasswordRequestRouter} from "./routes/authentication/requestToResetPassword";
import { createResourceRouter } from "./routes/resource/new";
import { allResourceRouter } from "./routes/resource/all";
import { showResourceDetailRouter } from "./routes/resource/show";
import { updateResourceRouter } from "./routes/resource/update";
import { deleteResourceRouter } from "./routes/resource/delete";
import { allCompanyRouter } from "./routes/company/all";
import { deleteCompanyRouter } from "./routes/company/delete";
import { createCompanyRouter } from "./routes/company/new";
import { showCompanyDetailRouter } from "./routes/company/show";
import { updateCompanyRouter } from "./routes/company/update";
import { showUserCompanyListRouter } from "./routes/company/showUserCompanyList";
import { switchCompanyRouter } from "./routes/authentication/switchCompany";
import { allDatamodelRouter } from "./routes/data-model/all";
import { deleteDatamodelRouter } from "./routes/data-model/delete";
import { createDatamodelRouter } from "./routes/data-model/new";
import { showDatamodelDetailRouter } from "./routes/data-model/show";
import { updateDatamodelRouter } from "./routes/data-model/update";
import { allDataRecordRouter } from "./routes/data-record/all";
import { deleteDataRecordRouter } from "./routes/data-record/delete";
import { createDataRecordRouter } from "./routes/data-record/new";
import { showDataRecordDetailRouter } from "./routes/data-record/show";
import { updateDataRecordRouter } from "./routes/data-record/update";
import { runWorkflowRouter } from "./routes/workflow/run";
import { showDashboardDetailRouter } from "./routes/dashboard/show";
import { allWorkflowInstanceRouter } from "./routes/workflow-instance/all";
import { allIntegrationsRouter } from "./routes/integration/all";
import { createIntegrationRouter } from "./routes/integration/new";
import { showIntegrationRouter } from "./routes/integration/show";
import { updateIntegrationRouter } from "./routes/integration/update";
import { deleteIntegrationRouter } from "./routes/integration/delete";
import { callbackIntegrationRouter } from "./routes/integration/callback";
import { connectIntegrationRouter } from "./routes/integration/connect";
import { activeIntegrationRouter } from "./routes/integration/isActive";
import { allApisRouter } from "./routes/integration/getApiActionList";
import { recentWorkflowRunRouter } from "./routes/workflow-instance/recent";
import { allDataRecordsWithoutPaginationRouter } from "./routes/data-record/allRecord";
import { indexUserRouter } from "./routes/user";
import { allUserRouter } from "./routes/user/all";
import { createUserRouter } from "./routes/user/new";
import { updateUserRouter } from "./routes/user/update";
import { showUserDetailRouter } from "./routes/user/show";
import { getDataModelReferenceRouter } from "./routes/data-model/getReferenceType";
import { gettokenRouter } from "./routes/authentication/getToken";
import path from "path";
import { allNoteRouter } from "./routes/note/all";
import { createNoteRouter } from "./routes/note/new";
import { duplicateDataRecordRouter } from "./routes/data-record/getDuplicate";
import {getDataModelGetPropertiesRouter} from "./routes/data-model/getProperties";
import { updateDocStatus } from "./routes/zoho/updateDocStatus";
import { vrpPayment } from "./routes/moneyhub/paymentAgainstVRP";
import { vrpConsent } from "./routes/moneyhub/vrpStatus";
import { vrpConsentUrl } from "./routes/moneyhub/vrpConsentUrl";
import { getRecordByKey } from "./routes/data-record/getRecordByKey";
import { exchangeCodeForToken } from "./routes/moneyhub/exchangeCodeForToken";
import {logActivity} from "./helper/log";
import { completionCheck } from "./routes/contracts/completionCheck";
import { sendDoc } from "./routes/zoho/sendDoc";
import { revokeVRPConsent } from "./routes/moneyhub/revokeVRPConsent";
import { getTransaction } from "./routes/contracts/getTransaction";
import { newTransaction } from "./routes/contracts/newTransaction";
import calculateInterest from "./classes/InterestCalculator";
import { livePushTest } from "./routes/dashboard/livepushtest";
import { openBanking } from "./routes/integration/getOpenBankingData";
import { getAnalytics } from "./routes/data-record/getAnalytics";
import { instanceDetails } from "./routes/workflow-instance/instance-details";
import { getAccounts } from "./routes/data-record/getAccounts";
import { getStatuses } from "./routes/data-record/getStatuses";
import { getApplications } from "./routes/data-record/getApplications";
import { getConsents } from "./routes/data-record/getConsents";
import { resumeWorkflowRouter } from "./routes/workflow/resume";
import { search } from "./routes/data-record/search";
import { getReasonByRecordId } from "./routes/reasons/getReasonByRecordId";
import { getNotificationListRouter } from "./routes/notification/getNotificationAndCount";
import { markNotificationRouter } from "./routes/notification/markNotificationRead";
import { getParticularInstanceListRoute } from "./routes/workflow-instance/getParticularInstance";
import { getNotificationSettingsRouter } from "./routes/notification-settings/getExistingSettings";
import { updateNotificationSettingsRouter } from "./routes/notification-settings/update";
import { getContractDetails } from "./routes/contracts/getContractDetails";
import { calculateInterestRouter } from "./routes/cronjob/run";
import { saveWebhookSetting } from "./routes/webhook/save";
import { getWebhookSetting } from "./routes/webhook";
import { getConsentFromWebhook } from "./routes/webhook/getWebhookConsent";
import { getWebhookEvents } from "./routes/webhook/getWebhookEvent";
import { allActivityRouter } from "./routes/Activity/all";

export interface RequestWithRawBody extends Request {
  rawBody: string;
}

const app: Express = express();
const swaggerUi = require('swagger-ui-express');
const swaggerFilePath = path.join(__dirname, '..', 'swagger.json')
const swaggerDocument = require(swaggerFilePath);
const cron = require('node-cron')

cron.schedule('0 0 * * *', async () => {
  calculateInterest();
});

app.set("trust proxy", true);
app.use(json({
  verify: (req, res, buf, encoding) => {
    (req as RequestWithRawBody).rawBody = buf.toString(encoding as BufferEncoding || "utf-8")
  }
}));
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
if (process.env.ENVIRONMENT == "local") {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URI || "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', ['Content-Type', 'Authorization']);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  app.use(
      cookieSession({
          signed: false,
          secure: false,
          httpOnly: false
      })
  );
}
app.use('/api/swaggerui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Authentication Routers
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(updateRolesRouter)
app.use(updateUserInfoRouter)
app.use(resetPasswordRouter)
app.use(currentUserRouter)
app.use(deleteUserRouter)
app.use(resetPasswordRequestRouter)
app.use(switchCompanyRouter)
app.use(gettokenRouter)

// Notification Routes
app.use(getNotificationListRouter)
app.use(markNotificationRouter)
app.use(getNotificationSettingsRouter)
app.use(updateNotificationSettingsRouter)
// User Routers
app.use(indexUserRouter);
app.use(allUserRouter);
app.use(deleteUserRouter);
app.use(createUserRouter);
app.use(updateUserRouter);
app.use(showUserDetailRouter);

// Company Routes
app.use(showUserCompanyListRouter)
app.use(allCompanyRouter);
app.use(deleteCompanyRouter);
app.use(createCompanyRouter);
app.use(showCompanyDetailRouter);
app.use(updateCompanyRouter);

// DataModel Routes
app.use(allDatamodelRouter)
app.use(getDataModelGetPropertiesRouter)
app.use(getDataModelReferenceRouter)
app.use(deleteDatamodelRouter)
app.use(createDatamodelRouter)
app.use(showDatamodelDetailRouter)
app.use(updateDatamodelRouter)

// DataRecord Routes
app.use(allDataRecordsWithoutPaginationRouter)
app.use(allDataRecordRouter)
app.use(deleteDataRecordRouter)
app.use(createDataRecordRouter)
app.use(showDataRecordDetailRouter)
app.use(updateDataRecordRouter)
app.use(duplicateDataRecordRouter)
app.use(getRecordByKey)
app.use(getAccounts)
app.use(getStatuses)
app.use(getApplications)
app.use(getConsents)
app.use(search)
app.use(getContractDetails)

// Workflow Routers
app.use(runWorkflowRouter);
app.use(allWorkflowsRouter)
app.use(deleteWorkflowRouter)
app.use(createWorkflowRouter)
app.use(showWorkflowDetailRouter)
app.use(updateWorkflowRouter)
app.use(resumeWorkflowRouter)

// Workflow step Routers
app.use(allworkflowStepRouter)
app.use(deleteWorkflowStepRouter)
app.use(createWorkflowStepRouter)
app.use(showWorkflowStepDetailRouter)
app.use(updateWorkflowStepRouter)

// Workflow instance routers
app.use(recentWorkflowRunRouter)
app.use(allWorkflowInstanceRouter)
app.use(instanceDetails)
app.use(getParticularInstanceListRoute)

// Resource Routers
app.use(allResourceRouter)
app.use(createResourceRouter)
app.use(showResourceDetailRouter)
app.use(updateResourceRouter)
app.use(deleteResourceRouter)

// Integration Routers
app.use(connectIntegrationRouter);
app.use(callbackIntegrationRouter);
app.use(createIntegrationRouter);
app.use(allIntegrationsRouter);
app.use(allApisRouter);
app.use(showIntegrationRouter);
app.use(updateIntegrationRouter);
app.use(deleteIntegrationRouter);
app.use(activeIntegrationRouter);


// Rule Routers
app.use(allRulesRouter)
app.use(deleteRuleRouter)
app.use(createRuleRouter)
app.use(showRuleDetailRouter)
app.use(updateRuleRouter)

// RuleSet Routers
app.use(allRuleSetRouter)
app.use(deleteRuleSetRouter)
app.use(createRuleSetRouter)
app.use(showRuleSetDetailRouter)
app.use(updateRuleSetRouter)

// RuleAction Routers
app.use(allRuleActionRouter)
app.use(deleteRuleActionRouter)
app.use(createRuleActionRouter)
app.use(showRuleActionDetailRouter)
app.use(updateRuleActionRouter)
app.use(executeRuleActionRouter)

// Dashboard routers
app.use(showDashboardDetailRouter);

// Note routers
app.use(allNoteRouter)
app.use(createNoteRouter)

// Zoho routers
app.use(updateDocStatus)
app.use(sendDoc)

// MoneyHub routers
app.use(vrpPayment)
app.use(vrpConsent)
app.use(vrpConsentUrl)
app.use(exchangeCodeForToken);
app.use(revokeVRPConsent);

// Contracts
app.use(completionCheck)
app.use(getTransaction)
app.use(newTransaction);

app.use(getReasonByRecordId);

app.use(openBanking)
app.use(getAnalytics)

app.use(livePushTest);

app.use(calculateInterestRouter);

//webhook

app.use(getWebhookSetting);
app.use(saveWebhookSetting);
app.use(getConsentFromWebhook);
app.use(getWebhookEvents);

//Activity
app.use(allActivityRouter);

app.get('/api/express-test', async (req: Request, res: Response) => {
    const returnMessage = process.env.CLIENT_URI + '<h1>Hello from the Express world !!</h1>';
    res.send(returnMessage);
});

// app.all("*", async (req, res) => {
//   throw new NotFoundError();
// });


app.use(errorHandler);

export { app };
//test run 02
