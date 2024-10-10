import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Company } from "../../models/company";
import { Workflow } from "../../models/workflow";
import { WorkflowInstance } from "../../models/workflow-instance";
import { WorkflowStep } from "../../models/workflow-step";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/instance/details",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {

        const { workflowId , recordId} = req.query;
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;

        const existingCompany = await Company.findById(company_id);
        if (!existingCompany) {
            await logActivity(company_id, user_id, "Workflow", "Company doesn't exist.");
            throw new BadRequestError("Company doesn't exist");
        }
        
        // do the latest one workflow instance
        const workflowRun = await WorkflowInstance.findOne({recordId: recordId, company: company_id, workflow: workflowId}).sort({createdAt: -1});
        if (!workflowRun) {
            await logActivity(company_id, user_id, "Workflow", "Record not found.");
            throw new BadRequestError('No Record');
        }
        
        const workflowSteps = await WorkflowStep.find({ workflowInstanceId: workflowRun._id });
        await logActivity(company_id, user_id, "Workflow", "WorkFlow Instance: " + workflowRun.toString() + "\nSteps: " + workflowSteps.toString());
        res.send({ workflowInstance: workflowRun, steps: workflowSteps });
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      console.log(error);
      await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows: " + (error as Error).message.toString());
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as instanceDetails };
