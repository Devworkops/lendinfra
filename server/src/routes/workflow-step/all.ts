import { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import {logActivity} from "../../helper/log";

// Here we will fetch all general ledger for a company
import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/step/all/:workflowId?",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {

    try {
      const { workflowId } = req.params;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      // Get All workflow Step
      const workflowStep = await WorkflowStep.find({workflowId})
      await logActivity(company_id, user_id, "Workflow", "Requesting Parameters: " + workflowId.toString());

      if (workflowStep.length == 0) {
        await logActivity(company_id, user_id, "Workflow", "Workflow is not having steps");
        return res.send([]);
      }
      await logActivity(company_id, user_id, "Workflow", "Get all workflow steps: " + workflowStep.toString());
      return res.send(workflowStep);
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      console.log(error);
      await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows." + (error as Error).message.toString());
      return res.send({ message: error });
    }
  }
);

export { router as allworkflowStepRouter };
