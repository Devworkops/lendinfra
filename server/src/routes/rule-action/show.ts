import {Request, Response} from "express";
import {
  NotFoundError,
} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {RuleSet} from "../../models/rule-set";
import { RuleAction } from "../../models/rule-action";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.get(
    "/api/rule-action/:id",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const ruleAction = await RuleAction.findById(req.params.id);
      if (!ruleAction) {
        throw new NotFoundError();
      }

      res.send(ruleAction);
    }
);

export {router as showRuleActionDetailRouter};
