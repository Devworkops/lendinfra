import {Request, Response} from "express";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {RuleSet} from "../../models/rule-set";
import {logActivity} from "../../helper/log";

// Here we will fetch all general ledger for a company
const express = require("express");
const router = express.Router();

router.get(
    "/api/rule-set/all/:companyId?",
    // currentUser,
    // requireAuth,
    async (req: Request, res: Response) => {
      try {
        const {companyId} = req.params;
        // Get All Rule Set
        const ruleSets = await RuleSet.find({company: companyId});

        if (ruleSets.length == 0) {
          return res.send({message: "No Rule Set"});
        }

        return res.send(ruleSets);
      } catch (error) {
        console.log(error);
        return res.send({message: error});
      }
    }
);

export {router as allRuleSetRouter};
