import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { Workflow } from "../../models/workflow";
import {logActivity} from "../../helper/log";

import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.put(
  "/api/workflow/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    const workflow = await Workflow.findById(req.params.id);
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    if (!workflow) {
      await logActivity(company_id, user_id, "Workflow", "Workflow not found.");
      throw new NotFoundError();
    }

    if (req.body.name !== undefined) {
      workflow.name = req.body.name;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Name: " + req.body.name.toString());
    }

    if (req.body.description !== undefined) {
      workflow.description = req.body.description;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Description: " + req.body.description.toString());
    }

    if (req.body.company !== undefined) {
      workflow.company = req.body.company;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Company: " + req.body.company.toString());
    }

    if (req.body.createdBy !== undefined) {
      workflow.createdBy = req.body.createdBy;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow CreatedBy: " + req.body.createdBy.toString());
    }

    if (req.body.type !== undefined) {
      workflow.type = req.body.type;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Type: " + req.body.type.toString());
    }

    if (req.body.object !== undefined) {
      workflow.object = req.body.object;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Object: " + req.body.object.toString());
    }

    if (req.body.filterType !== undefined) {
      workflow.filterType = req.body.filterType;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow filter type: " + req.body.filterType.toString());
    }

    if (req.body.triggerType !== undefined) {
      workflow.triggerType = req.body.triggerType;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Trigger Type: " + req.body.triggerType.toString());
    }

    if (req.body.filterConditions !== undefined) {
      workflow.filterConditions = req.body.filterConditions;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Filters: " + req.body.filterConditions.toString());
    }

    if (req.body.status !== undefined) {
      workflow.status = req.body.status;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Status: " + req.body.status.toString());
    }

    if (req.body.isActive !== undefined) {
      workflow.isActive = req.body.isActive;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Active Status: " + req.body.isActive.toString());
    }

    console.log(req.body)
    if (req.body.config !== undefined) {
      workflow.config = req.body.config;
      await logActivity(company_id, user_id, "Workflow", "Updating Workflow Config: " + req.body.config.toString());
    }

    await workflow.save();
    await logActivity(company_id, user_id, "Workflow", "Updating Workflow Successfully: " + workflow.toString());
    res.send(workflow);
  }
);

export { router as updateWorkflowRouter };
