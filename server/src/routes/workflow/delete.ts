import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Workflow } from "../../models/workflow";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.delete(
  "/api/workflow/:workflowId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { workflowId } = req.params;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "Workflow", "Request Query: " + workflowId.toString());
    const workflow = await Workflow.findByIdAndUpdate(workflowId, {isActive:false});
    if (!workflow) {
        await logActivity(company_id, user_id, "Workflow", "Workflow not found: " + workflowId.toString());
        throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "Workflow", "Workflow Deleted Successfully: " + workflow.toString());
    res.status(204).send(workflow);
  }
);

export { router as deleteWorkflowRouter };
