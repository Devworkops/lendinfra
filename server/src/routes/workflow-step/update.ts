import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.put(
  "/api/workflow/step/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    const workflowStep = await WorkflowStep.findById(req.params.id);
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    if (!workflowStep) {
      await logActivity(company_id, user_id, "Workflow", "Workflow step not found.");
      throw new NotFoundError();
    }

    if (req.body.name !== undefined) {
      workflowStep.name = req.body.name;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Step Name: " + req.body.name.toString());
    }

    if (req.body.description !== undefined) {
      workflowStep.description = req.body.description;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Step Description: " + req.body.description.toString());
    }

    if (req.body.inputValues !== undefined) {
      workflowStep.inputValues = req.body.inputValues;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Step Input Values: " + req.body.inputValues.toString());
    }

    if (req.body.condition !== undefined) {
      workflowStep.condition = req.body.condition;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Step Condition: " + req.body.condition.toString());
    }

    await workflowStep.save();
    await logActivity(company_id, user_id, "Workflow", "Updating Workflow Step Successfully: " + workflowStep.toString());
    res.send(workflowStep);
  }
);

export { router as updateWorkflowStepRouter };
