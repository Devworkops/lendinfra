import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Resource } from "../../models/resource";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.delete(
  "/api/workflow/resource/:resourceId",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const resource= await Resource.findByIdAndDelete(resourceId);
    if (!resource) {
      throw new NotFoundError();
    }

    res.status(204).send(resource);
  }
);

export { router as deleteResourceRouter };
