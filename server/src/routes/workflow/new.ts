import { Request, Response } from "express";
import { validationResult } from "express-validator";

// import { validateRequest } from "../../middleware/validate-request";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { Workflow } from "../../models/workflow";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
  "/api/workflow/new",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const { name, description, company, createdBy, type, triggerType, object, filterConditions, status, filterType } = req.body;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Request Query: " + req.body.toString());
      const workflow = Workflow.build({ name, description, company, createdBy, type, triggerType, object, filterConditions, status, filterType });
      await workflow.save();
      await logActivity(company_id, user_id, "Workflow", "Workflow created successfully: " + workflow.toString());
      console.log(workflow)
      res.status(201).send(workflow);
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

export { router as createWorkflowRouter };
