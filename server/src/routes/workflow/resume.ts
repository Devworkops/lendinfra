import { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowManager } from "../../classes/WorkflowManager";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/resume/:recordId/:stepId/:id/:wid/:wsid",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { recordId, stepId } = req.params;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      console.log(recordId, stepId, req.params.wsid)
      await logActivity(company_id, user_id, "Workflow", "Requesting Workflow Execution for: " + req.params.id.toString());
      const workflowManager = new WorkflowManager(recordId as string);
      await workflowManager.resume(stepId, req.params.id, req.params.wid, req.params.wsid);
      await logActivity(company_id, user_id, "Workflow", "Workflow is resumed");
      res.status(200)
        .send({
          message: `Workflow is resumed`,
        });
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Error while resuming the workflow: " + (error as Error).message.toString());
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as resumeWorkflowRouter };
