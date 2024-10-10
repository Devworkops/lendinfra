import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import { DataRecord } from "../../models/data-record";
import { random } from "lodash";
import mongoose from "mongoose";
import { Datamodel } from "../../models/data-model";
import { WorkflowManager } from "../../classes/WorkflowManager";
import { TriggerType, Workflow } from "../../models/workflow";
import {BadRequestError} from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

import express from 'express';
import { runWorkflowUtils } from "../../common/runWorkflowOnUpdate";
import { activity } from "../../helper/activity";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.post(
  "/api/datarecord/new",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      const { objectName, dataModel, company, createdBy, fields } = req.body;

      let uniqueId = "";

      // find all the record
      const dataRecordCount = await DataRecord.find({ objectName, company }).lean().count();
      // Get data model
      const dataModelDetail = await Datamodel.findById(dataModel);
      let recordId = '';
      let primaryKey = "";
      let secondaryKey = "";
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "DataRecord Request", req.body.toString());
        if (dataModelDetail) {
          recordId = dataModelDetail.prefix + ' ' + (dataRecordCount + 1)
          if (dataModelDetail.primaryKeys) {
            primaryKey = dataModelDetail.primaryKeys;
          }
          else {
            primaryKey = "";
          }
          if (dataModelDetail.secondaryKeys) {
            secondaryKey = dataModelDetail.secondaryKeys;
          }
          else {
            secondaryKey = "";
          }
        }
        else {
          recordId = dataRecordCount + 1 + '';
          primaryKey = "";
          secondaryKey = "";
        }

      if (typeof fields[secondaryKey] === undefined || secondaryKey == "") {
        if (typeof fields[primaryKey] === undefined || primaryKey == "") {
          uniqueId = "";
        }
        else {
          uniqueId = fields[primaryKey];
        }
      }
      else {
        uniqueId = fields[primaryKey] + fields[secondaryKey];
      }

      let primaryKeyValue = fields[primaryKey];
      let secondaryKeyValue = fields[secondaryKey];

      // Get Primary Keys from dataModelDetails
      // Map primary key with fieldData
      // find data record with same primary keys

        // let existingRecord;
        // if (uniqueId){
        //     existingRecord = await DataRecord.findOne({company: company, uniqueId: uniqueId});
        //     if (existingRecord) {
        //         await logActivity(company_id, user_id, "DataModel", "Record already exist with a combination of " + primaryKey + " " + secondaryKey);
        //         throw new BadRequestError("Record already exist with a combination of " + primaryKey + " " + secondaryKey);
        //     }
        // }
        // if (primaryKey){
        //     existingRecord = await DataRecord.findOne({company: company, primaryKey: primaryKeyValue});
        //     if (existingRecord) {
        //         await logActivity(company_id, user_id, "DataModel", "Record already exist with same " + primaryKey);
        //         throw new BadRequestError("Record already exist with same " + primaryKey);
        //     }
        // }
        // if (secondaryKey){
        //     existingRecord = await DataRecord.findOne({company: company, secondaryKey: secondaryKeyValue});
        //     if (existingRecord) {
        //         await logActivity(company_id, user_id, "DataModel", "Record already exist with same " + secondaryKey);
        //         throw new BadRequestError("Record already exist with same " + secondaryKey);
        //     }
        // }

      const datarecord = DataRecord.build({ objectName, uniqueId, primaryKey: primaryKeyValue, secondaryKey: secondaryKeyValue, dataModel: dataModel, company, createdBy, fields, recordId });
      await datarecord.save();

      if(objectName == "Contract") {
        const dataModelDetail = await Datamodel.findOne({name: "Transaction", company: datarecord.company});
        const dataRecordCount = await DataRecord.find({ objectName: "Transaction", company: datarecord.company, 'fields.ContractId': datarecord._id.toString() }).lean().count();

        const recordId = dataModelDetail?.prefix + ' ' + (dataRecordCount + 1)

        const facilityTransaction = {
          Type: "FacilityStart",
          ContractId: datarecord._id.toString(),
          //@ts-ignore          
          StartingBalance:datarecord.fields.FacilityAmount,
          //@ts-ignore
          EndingBalance:datarecord.fields.FacilityAmount,
          //@ts-ignore
          FacilityAvailable: datarecord.fields.FacilityAmount,
          TotalOutstanding: 0
        };
        const newTransaction = new DataRecord({
          recordId: recordId,
          company: datarecord.company,
          objectName: "Transaction",
          primaryKey: "",
          dataModel: dataModelDetail?.id,
          //@ts-ignore
          fields: facilityTransaction
        })
        await newTransaction.save();
      }
        await activity(datarecord.id,company_id, user_id, objectName, "DataRecord Created.",req.body,datarecord );
        await logActivity(company_id, user_id, "DataRecord", "DataRecord Created");
        console.log("Run work on Create Record===================================")
        await runWorkflowUtils(datarecord.id as string , company_id as string, user_id as string,[TriggerType.create, TriggerType.update,TriggerType.createOrUpdate])
      res.status(201).send(datarecord);
    } catch (error) {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;
        await logActivity(company_id, user_id, "DataRecord", "Error while creating DataRecord.");
      console.log((error as Error).message);
      console.log((error as Error).stack);
      // throw (error as Error).message;
      res.status(400).send({ errors: [{ message: (error as Error).message }] });
    }
  }
);

export { router as createDataRecordRouter };
