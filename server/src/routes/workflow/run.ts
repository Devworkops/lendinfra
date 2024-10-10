import { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowManager } from "../../classes/WorkflowManager";
import {logActivity} from "../../helper/log";

import express from 'express';
import { runWorkflowUtils } from "../../common/runWorkflowOnUpdate";
import { TriggerType } from "../../models/workflow";
import { notfication } from "../../helper/notification";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get(
  "/api/workflow/run/:id?",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    console.log("Run work on button click===================================")
    try {
      const { recordId } = req.query;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Requesting Workflow Execution for: " + req.params.id.toString());
      const workflowManager = new WorkflowManager(recordId as string);
      await workflowManager.run(req.params.id, company_id, user_id);
      await logActivity(company_id, user_id, "Workflow", "Workflow is in progress");
      console.log("recordId---------------------",recordId)
      await runWorkflowUtils(recordId as string , company_id as string, user_id as string, [TriggerType.update,TriggerType.createOrUpdate])
      
      res.status(200)
        .send({
          message: `Workflow is in progress`,
        });
    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Error while running the workflow: " + (error as Error).message.toString());
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as runWorkflowRouter };
