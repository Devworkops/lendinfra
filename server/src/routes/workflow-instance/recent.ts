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
  "/api/workflow/instance/recent",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    try {

      const { object, workflowInstanceId , recordId} = req.query;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      // Check valid company
      const existingCompany = await Company.findById(company_id);

      if (!existingCompany) {
        await logActivity(company_id, user_id, "Workflow", "Company doesn't exist.");
        throw new BadRequestError("Company doesn't exist");
      }

      let flowsId: any[] = [];
      if (!workflowInstanceId) {
        const configuredWorkflow = await Workflow.find({ company: company_id, object, isActive: true }).lean();
        configuredWorkflow.forEach((flow) => {
          flowsId.push(flow._id);
        })

        const recentWorkflowRun = await WorkflowInstance.findOne({ company: company_id, workflow: { $in: flowsId } , recordId}).populate('workflow').sort({ updatedAt: -1 });

        if (!recentWorkflowRun) {
          await logActivity(company_id, user_id, "Workflow", "Record not found.");
          throw new BadRequestError('No Record');
        }
        // get all the step
        const workflowSteps = await WorkflowStep.find({ workflowInstanceId: recentWorkflowRun._id });
        await logActivity(company_id, user_id, "Workflow", "WorkFlow Instance: " + recentWorkflowRun.toString() + "\nSteps: " + workflowSteps.toString());
        res.send({ workflowInstance: recentWorkflowRun, steps: workflowSteps });
      }
      else {
        const workflowRun = await WorkflowInstance.findById(workflowInstanceId).populate('workflow').sort({ updatedAt: -1 });

        if (!workflowRun) {
            await logActivity(company_id, user_id, "Workflow", "Record not found.");
            throw new BadRequestError('No Record');
        }
        // get all the step
        const workflowSteps = await WorkflowStep.find({ workflowInstanceId: workflowRun._id });
        await logActivity(company_id, user_id, "Workflow", "WorkFlow Instance: " + workflowRun.toString() + "\nSteps: " + workflowSteps.toString());
        res.send({ workflowInstance: workflowRun, steps: workflowSteps });
      }
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      console.log(error);
      await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows: " + (error as Error).message.toString());
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as recentWorkflowRunRouter };
