import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Workflow } from "../../models/workflow";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    await logActivity(company_id, user_id, "Workflow", "Request Query: " + req.params.id.toString());
    const workflow = await Workflow.findById(req.params.id)
    if (!workflow) {
      await logActivity(company_id, user_id, "Workflow", "Workflow not found.");
      throw new NotFoundError();
    }
    await logActivity(company_id, user_id, "Workflow", "Workflow: " + workflow.toString());
    res.send(workflow);
  }
);

export { router as showWorkflowDetailRouter };
