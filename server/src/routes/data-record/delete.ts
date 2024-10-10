import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";
import { TriggerType, Workflow } from "../../models/workflow";
import { WorkflowManager } from "../../classes/WorkflowManager";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.delete(
  "/api/datarecord/:datarecordId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { datarecordId } = req.params;
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
      const dataRecord = await DataRecord.findByIdAndUpdate(datarecordId, { isActive: false });
      if (!dataRecord) {
          await logActivity(company_id, user_id, "DataRecord", "DataRecord doesn't exists.");
        throw new NotFoundError();
      }

      try {
        // Find workflow
        const workflowsToRun = await Workflow.find({ object: dataRecord.objectName, company: dataRecord.company, isActive: true, triggerType: { $in: [TriggerType.delete, undefined] } }).lean();
        // Run Workflow
        if (workflowsToRun) {
          for (let workflow of workflowsToRun) {
            const workflowManager = new WorkflowManager(dataRecord.id);
            if(await workflowManager.checkEligibility(workflow)){
              // get workflow
              await workflowManager.run(workflow._id,company_id,user_id);
            }
          }
        }
      } catch (error) {
        await logActivity(company_id, user_id, "DataRecord", "Error while deleting DataRecord.");
        console.log(error)
      }
      await logActivity(company_id, user_id, "DataModel", "DataModel Deleted Successfully.");
      res.status(204).send(dataRecord);
    } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "DataRecord", "Error while deleting DataRecord.");
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as deleteDataRecordRouter };
