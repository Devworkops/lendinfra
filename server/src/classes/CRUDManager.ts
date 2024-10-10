import mongoose from 'mongoose';
import { NotFoundError } from '../errors/not-found-error';
import { activity } from '../helper/activity';
import { DataRecord } from '../models/data-record';
import { Reason } from '../models/reason';
import { Node } from '../models/workflow'
import {resolveObjectURL} from "buffer";
const { MongoClient, ObjectId } = require('mongodb');
export class CRUDManager {

    stepData: any;
    recordId: string;
    constructor(step: any, recordId: string) {
        this.stepData = step
        this.recordId = recordId
    }

    getRecord = async () => {
        // get record node
        const dataRecord = await DataRecord.findOne({ dataModel: this.stepData.data.stepData.record, primaryKey: this.recordId }).sort({ createdAt: -1 }).limit(1);
        if (dataRecord) {
            console.log('DataRecord found.', dataRecord);
        }
        return dataRecord
    }

    createRecord() {

    }

    updateRecord = async (company_id='',user_id='') => {
        console.log("------------this.stepData--------",this.stepData)

        // update data set
        const dataRecord = await DataRecord.findById(this.recordId)
        console.log("dataRecord------------2254--------",dataRecord)
        const updateFields: { [key: string]: any } = {};
        let updateDataRecord;
        if (dataRecord) {
            const changes: string[] = [];
            for (const assignment of this.stepData?.data?.stepData.assignmentValues) {
                console.log("assignment------------124--------",assignment)
                const field = assignment.variable.path
                const newValue = assignment.value;
                //@ts-ignore
                const oldValue = dataRecord.fields[field];
                if (oldValue instanceof mongoose.Types.ObjectId && typeof newValue === 'string') {
                    // Compare the string representation of the ObjectId
                    if (oldValue.toString() !== newValue) {
                        changes.push(`<strong>${field}</strong> is changed from <strong>${oldValue || 'None'}</strong> to <strong>${newValue}</strong>`);
                    }
                    continue; 
                  }
                if (oldValue !== newValue) {
                    changes.push(`<strong>${field}</strong> is changed from <strong>${
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
                
                updateFields[`fields.${field}`] = assignment.value;
            }
            const update = {
                $set: updateFields,
            };
            try {
                updateDataRecord = await DataRecord.updateOne({_id: ObjectId(this.recordId)}, update);
                console.log("updateDataRecord------------45744--------",updateDataRecord)
                if (changes.length > 0) {
                    const activityMessage = `DataRecord Updated, ${changes.join(', ')}`;
                    await activity(dataRecord.id, company_id, user_id, "DataRecord - Update", activityMessage, dataRecord);
                }
                console.log('DataRecord saved successfully.');
            } catch (error) {
                console.error('Error saving DataRecord:', error);
                updateDataRecord = "Error saving DataRecord"
            }
            
            let fields: { [key: string]: any } = {};;
            this.stepData.data.stepData.assignmentValues.forEach((value: any) => {
                const key = value.variable.path;
                const reasonValue = value.reason;
                fields[key] = {reason : reasonValue, value: value.value};
            });
            if (Object.keys(fields).length > 0) { 
                const reason = await Reason.findOne({primaryKey: this.recordId, objectName: dataRecord.objectName})
                if(reason) {
                    reason.fields = fields;
                    await reason.save();
                } else {   
                    const reasonData = await Reason.build({
                        primaryKey: this.recordId,
                        company: dataRecord.company,
                        objectName: dataRecord.objectName,
                        createdBy: dataRecord.createdBy,
                        fields: fields,
                    })
                    await reasonData.save();
                }
            }
        }
        return updateDataRecord;
    };

    deleteRecord = async () => {
        const dataRecord = await DataRecord.findById(this.recordId)
        const updateFields: { [key: string]: any } = {};
        if (dataRecord) {
            updateFields[`fields.isActive`] = false;
            const update = {
                $set: updateFields,
            };
            try {
                await DataRecord.updateOne({_id: ObjectId(this.recordId)}, update);
                console.log('DataRecord has been deleted successfully.');
            } catch (error) {
                console.error('Error saving DataRecord:', error);
            }
        }
    }
}
