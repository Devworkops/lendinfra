import {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {Rule} from "../../models/rule";
import {logActivity} from "../../helper/log";

// Here we will fetch all general ledger for a company
const express = require("express");
const router = express.Router();

router.get(
    "/api/rule/all/:ruleSetId?",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      try {
        const {ruleSetId} = req.params;
        // Get All Rules
        const rules = await Rule.find({ruleSet: ruleSetId});

        if (rules.length == 0) {
          return res.send([]);
        }

        return res.send(rules);
      } catch (error) {
        console.log(error);
        return res.send({message: error});
      }
    }
);

export {router as allRulesRouter};
