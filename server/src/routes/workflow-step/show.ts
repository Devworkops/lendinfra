import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/step/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "Workflow", "Request Query: " + req.params.id.toString());
    const workflowStep = await WorkflowStep.findById(req.params.id)
    if (!workflowStep) {
      await logActivity(company_id, user_id, "Workflow", "Workflow step not found.");
      throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "Workflow", "Workflow Step: " + workflowStep.toString());
    res.send(workflowStep);
  }
);

export { router as showWorkflowStepDetailRouter };
