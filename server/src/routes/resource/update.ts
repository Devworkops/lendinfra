import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import { Resource } from "../../models/resource";
import { validateRequest } from "../../middleware/validate-request";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.put(
  "/api/workflow/resource/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError();
    }

    if (req.body.apiName !== undefined) {
        resource.apiName = req.body.apiName;
    }

    if (req.body.description !== undefined) {
        resource.description = req.body.description;
    }

    if (req.body.dataType !== undefined) {
        resource.dataType = req.body.dataType;
    }

    if (req.body.body !== undefined) {
        resource.body = req.body.body;
    }

    if (req.body.order !== undefined) {
        resource.order = req.body.order;
    }

    if (req.body.active !== undefined) {
        resource.active = req.body.active;
    }

    if (req.body.multipleAllowed !== undefined) {
        resource.multipleAllowed = req.body.multipleAllowed;
    }

    if (req.body.avilableForInput !== undefined) {
        resource.avilableForInput = req.body.avilableForInput;
    }

    if (req.body.availableForOutput !== undefined) {
        resource.availableForOutput = req.body.availableForOutput;
    }

    if (req.body.defaultValue !== undefined) {
        resource.defaultValue = req.body.defaultValue;
    }

    if (req.body.object !== undefined) {
        resource.object = req.body.object;
    }

    if (req.body.decimalPlaces !== undefined) {
        resource.decimalPlaces = req.body.decimalPlaces;
    }


    await resource.save();

    res.send(resource);
  }
);

export { router as updateResourceRouter };
