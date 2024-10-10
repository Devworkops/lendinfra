import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";
import { Workflow } from "../../models/workflow";
import { WorkflowInstance, WorkflowStatus } from "../../models/workflow-instance";
import {logActivity} from "../../helper/log";
import { Integration } from "../../models/integration";
import { Datamodel } from "../../models/data-model";

const express = require('express');
const router = express.Router();

router.get(
    "/api/dashboard/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {

        if (!req.currentUser || !req.currentUser.companyId)
            throw new BadRequestError('Invalid Company Id');

        const companyId = req.currentUser.companyId;

        // get all the workflows count
        const workflow = await Workflow.find({ company: companyId }).lean().count();
        // get all the active workflows count
        const activeWorkflow = await Workflow.find({ company: companyId, isActive: true }).lean().count();
        // get Accounts(individual and business) count
        const individualAccounts = await DataRecord.find({ company: companyId, objectName: "IndividualAccount", isActive: true }).lean().count();
        const businessAccounts = await DataRecord.find({ company: companyId, objectName: "BusinessAccount", isActive: true }).lean().count();
        const accounts = { individualAccounts: individualAccounts, businessAccounts: businessAccounts }
        // get different type of Applications count 
        const applicationDataModels = (await Datamodel.find({ company: companyId, label: 'Application' })).map(item => item.name)
        const applicationsPromises = applicationDataModels.map(async (application) => {
            const count = await DataRecord.find({ company: companyId, objectName: application, isActive: true }).lean().count();
            return {
                name: application,
                count: count
            };
        });
        const applications = await Promise.all(applicationsPromises);        
        // get all the instances running
        const instanceCount = await WorkflowInstance.find({ company: companyId, status: WorkflowStatus.inProgress }).lean().count();
        // get all the integrations connected
        const integrations = await Integration.find({ company: companyId }).lean().count();

        res.send({ workflow, activeWorkflow, accounts, applications, instanceCount, integrations});
    }
);

export { router as showDashboardDetailRouter };
