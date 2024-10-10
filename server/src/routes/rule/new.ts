import { Request, Response } from "express";
import { validationResult } from "express-validator";

// import { validateRequest } from "../../middleware/validate-request";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { Rule } from "../../models/rule";
import { RuleSet } from "../../models/rule-set";
import {logActivity} from "../../helper/log";

const express = require('express');
const router = express.Router();

router.post(
  "/api/rule/new",
  // currentUser,
  // requireAuth,
  // validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const { name, ruleSet, priority, criteria, event, condition, isActive } = req.body;

      // Check if existing rule set
      const existingRuleSet = await RuleSet.findById(ruleSet);
      if (existingRuleSet == undefined) {
        throw new BadRequestError("invalid Rule set");
      }
      const rule = Rule.build({ name, ruleSet, priority, criteria, event, condition, isActive });
      await rule.save();
      res.status(201).send(rule);
    } catch (error) {
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw (error as Error).message;
    }
  }
);

export { router as createRuleRouter };
