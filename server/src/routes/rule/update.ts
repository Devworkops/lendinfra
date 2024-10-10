import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Rule } from "../../models/rule";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.put(
  "/api/rule/:id",
  // currentUser,
  // requireAuth,
  // validateRequest,
  async (req: Request, res: Response) => {

    const rule = await Rule.findById(req.params.id);

    if (!rule) {
      throw new NotFoundError();
    }

    if (req.body.name !== undefined) {
      rule.name = req.body.name;
    }

    if (req.body.condition !== undefined) {
      rule.condition = req.body.condition;
    }

    if (req.body.priority !== undefined) {
      rule.priority = req.body.priority;
    }

    if (req.body.criteria !== undefined) {
      rule.criteria = req.body.criteria;
    }

    if (req.body.event !== undefined) {
      rule.event = req.body.event;
    }

    if (req.body.isActive !== undefined) {
      rule.isActive = req.body.isActive;
    }

    await rule.save();

    res.send(rule);
  }
);

export { router as updateRuleRouter };
