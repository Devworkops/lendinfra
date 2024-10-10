import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { WorkflowStep } from "../../models/workflow-step";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
  "/api/workflow/step/new",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;

      const { label, name, description, workflowInstanceId, type, inputValues, condition, args, dependsOn, functionDetail, status } = req.body;
      await logActivity(company_id, user_id, "Workflow", "Request Query: " + req.body.toString());
      const workflowStep = WorkflowStep.build({ label, name, description, workflowInstanceId, type, inputValues, condition, args, dependsOn, functionDetail, status});
      await workflowStep.save();
      await logActivity(company_id, user_id, "Workflow", "Workflow created successfully: " + workflowStep.toString());
      res.status(201).send(workflowStep);
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Error while creating workflow: " + (error as Error).message.toString());
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as createWorkflowStepRouter };
