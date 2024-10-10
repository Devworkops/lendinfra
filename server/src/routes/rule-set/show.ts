import {Request, Response} from "express";
import {
  NotFoundError,
} from "../../errors/not-found-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {RuleSet} from "../../models/rule-set";
import {logActivity} from "../../helper/log";

const express = require("express");
const router = express.Router();

router.get(
    "/api/rule-set/:id",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      const ruleSet = await RuleSet.findById(req.params.id);
      if (!ruleSet) {
        throw new NotFoundError();
      }

      res.send(ruleSet);
    }
);

export {router as showRuleSetDetailRouter};
