import { Request, Response } from "express";
import {
  NotFoundError
} from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowStep } from "../../models/workflow-step";
import { Resource } from "../../models/resource";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.get(
  "/api/workflow/resource/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const resource = await Resource.findById(req.params.id)
    if (!resource) {
      throw new NotFoundError();
    }

    res.send(resource);
  }
);

export { router as showResourceDetailRouter };
