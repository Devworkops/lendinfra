import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.delete(
  "/api/workflow/step/:workflowStepId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { workflowStepId } = req.params;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "Workflow", "Request Query: " + workflowStepId.toString());
    const workflowStep= await WorkflowStep.findByIdAndDelete(workflowStepId);
    if (!workflowStep) {
      await logActivity(company_id, user_id, "Workflow", "Workflow Steps not found: " + workflowStepId.toString());
      throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "Workflow", "Workflow Step Deleted Successfully: " + workflowStepId.toString());
    res.status(204).send(workflowStep);
  }
);

export { router as deleteWorkflowStepRouter };
