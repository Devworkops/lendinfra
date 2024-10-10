import {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {RuleAction} from "../../models/rule-action";
import {RuleSet} from "../../models/rule-set";
import {logActivity} from "../../helper/log";

// Here we will fetch all general ledger for a company
const express = require("express");
const router = express.Router();

router.get(
    "/api/rule-action/all/:ruleSetId?",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      try {
        const {ruleSetId} = req.params;
        // Get Rule Set
        const ruleSet = await RuleSet.findById(ruleSetId);

        if (!ruleSet) {
          return res.send({message: "No Rule Set Present"});
        }

        const ruleActions = await RuleAction.find({ruleSet: ruleSet});

        if (!ruleActions) {
          return res.send([]);
        }

        // Get all rule action
        return res.send(ruleActions);
      } catch (error) {
        console.log(error);
        return res.send({message: error});
      }
    }
);

export {router as allRuleActionRouter};
