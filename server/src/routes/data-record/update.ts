import { Request, Response } from "express";
import { NotFoundError } from "../../errors/not-found-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { validateRequest } from "../../middleware/validate-request";
import { DataRecord } from "../../models/data-record";
import {Datamodel, DatamodelDoc} from "../../models/data-model";
import {BadRequestError} from "../../errors/bad-request-error";
import {logActivity} from "../../helper/log";

import express from 'express';
import mongoose from "mongoose";
import { runWorkflowUtils } from "../../common/runWorkflowOnUpdate";
import { TriggerType } from "../../models/workflow";
import { activity } from "../../helper/activity";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.put(
  "/api/datarecord/:id",
  currentUser,
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const dataRecord = await DataRecord.findById(req.params.id);
    let primaryKey = "";
    let secondaryKey = "";
    let dataModelID = "";
    let dataModelDetail: DatamodelDoc | null = null;
    let uniqueId = "";
    let updatedFields:string[]=[]
    const fields = req.body.fields;
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;

    if (!dataRecord) {
        await logActivity(company_id, user_id, "DataRecord", "DataRecord doesn't exists.");
      throw new NotFoundError();
    }

      if (dataRecord){
        const compareFields = (oldData: any, newData: any, prefix: string = '') => {
          for (const key in newData) {
              if (newData.hasOwnProperty(key)) {
                  const oldValue = oldData[key];
                  const newValue = newData[key];

                  if (oldValue instanceof mongoose.Types.ObjectId && typeof newValue === 'string') {
                    // Compare the string representation of the ObjectId
                    if (oldValue.toString() !== newValue) {
                        updatedFields.push(`${prefix}${key} is changed from <strong>${oldValue || 'None'}</strong> to <strong>${newValue}</strong>`);

                    }
                    continue; // Skip further checks for this key
                  }

                  // If the value is an object, recurse into it
                  if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
                      compareFields(oldValue, newValue, `${prefix}${key}.`);
                  } else {
                      // Compare and log changes for primitive values
                      // if (oldValue !== newValue) {
                      //     updatedFields.push(`${prefix}${key} is changed from ${oldValue || 'None'} to ${newValue || 'None'}`);
                      // }
                      if (oldValue !== newValue) {
                        updatedFields.push(
                          `<strong>${prefix}${key}</strong> is changed from <strong>${
                            (typeof oldValue === 'boolean')
                              ? (oldValue ? 'Yes' : 'No')
                              : (oldValue || 'None')
                          }</strong> to <strong>${
                            (typeof newValue === 'boolean')
                              ? (newValue ? 'Yes' : 'No')
                              : (newValue || 'None')
                          }</strong>`
                        );
                      }
                  }
              }
          }
        };
        compareFields(dataRecord.fields, fields); 
        dataModelID = dataRecord.dataModel._id;
        dataModelDetail = await Datamodel.findById(dataModelID);
        if (dataModelDetail) {
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
      }

      if (typeof dataRecord.secondaryKey === undefined || secondaryKey == "") {
          if (typeof dataRecord.primaryKey === undefined || primaryKey == "") {
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

      // let existingRecord;
      // if (uniqueId){
      //     existingRecord = await DataRecord.findOne({company: dataRecord.company, uniqueId: uniqueId});
      //     if (existingRecord && primaryKeyValue !== dataRecord.primaryKey && secondaryKeyValue !== dataRecord.secondaryKey) {
      //         await logActivity(company_id, user_id, "DataRecord", "Record already exist with a combination of " + primaryKey + " " + secondaryKey);
      //         throw new BadRequestError("Record already exist with a combination of " + primaryKey + " " + secondaryKey);
      //     }
      // }
      // if (primaryKey){
      //     existingRecord = await DataRecord.findOne({company: dataRecord.company, primaryKey: primaryKeyValue});
      //     if (existingRecord && primaryKeyValue !== dataRecord.primaryKey) {
      //         await logActivity(company_id, user_id, "DataRecord", "Record already exist with same " + primaryKey);
      //         throw new BadRequestError("Record already exist with same " + primaryKey);
      //     }
      // }
      // if (secondaryKey){
      //     existingRecord = await DataRecord.findOne({company: dataRecord.company, secondaryKey: secondaryKeyValue});
      //     if (existingRecord && secondaryKeyValue !== dataRecord.secondaryKey) {
      //         await logActivity(company_id, user_id, "DataRecord", "Record already exist with same " + secondaryKey);
      //         throw new BadRequestError("Record already exist with same " + secondaryKey);
      //     }
      // }

    if (req.body.objectName !== undefined) {
      dataRecord.objectName = req.body.objectName;
        await logActivity(company_id, user_id, "DataRecord - Update Object Name", dataRecord.objectName.toString());
    }

    if (req.body.fields !== undefined) {
      dataRecord.fields = req.body.fields;
      if (dataModelDetail && dataModelDetail.properties && typeof dataModelDetail.properties === 'object') {
        const properties = dataModelDetail.properties as { [key: string]: { type: string } };
        for (const key in properties) {
          if (properties.hasOwnProperty(key)) {
            if (properties[key].type == 'reference') {
              //@ts-ignore
              dataRecord.fields[key] = new mongoose.Types.ObjectId(dataRecord.fields[key]);
            }
          }
        }
      }
        await logActivity(company_id, user_id, "DataRecord - Update Fields", dataRecord.fields.toString());
    }

    if (req.body.isActive !== undefined) {
      dataRecord.isActive = req.body.isActive;
      await logActivity(company_id, user_id, "DataRecord - Update Active", req.body.isActive.toString());
    }

    dataRecord.primaryKey = primaryKeyValue;
    dataRecord.secondaryKey = secondaryKeyValue;
    dataRecord.uniqueId = uniqueId;

    await dataRecord.save();
    await activity(dataRecord.id,company_id, user_id, req.body.objectName, `DataRecord Updated, ${updatedFields}`,dataRecord, req.body );

    await logActivity(company_id, user_id, "DataRecord - Update", "DataRecord updated successfully.");
    console.log("Run work on update Record===================================")
    await runWorkflowUtils(req.params.id as string , company_id as string, user_id as string,[TriggerType.update,TriggerType.createOrUpdate])
    res.send(dataRecord);
  }  
);

export { router as updateDataRecordRouter };
