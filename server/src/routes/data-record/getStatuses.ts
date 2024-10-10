import { Request, Response } from "express";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord} from "../../models/data-record";

import express from 'express';
import { Datamodel, DatamodelDoc } from "../../models/data-model";
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

router.get("/api/datarecords/statuses",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        company_id = req?.currentUser?.companyId;
        user_id = req?.currentUser?.id;

        const dataModels = await Datamodel.find({label: 'Application', company: company_id})
        const objectNames = dataModels.map(dataModel => dataModel.name);
        const uniqueStatuses = new Set<string>();
        dataModels.map((dataModel) => {
            //@ts-ignore
            const status = dataModel?.properties?.['Status'];
            if(status?.type === 'list') {
                status.list.forEach((item: string) => {uniqueStatuses.add(item)});
            }
        })
        const dataRecords = await DataRecord.find({company: company_id, dataModel: { $in: dataModels.map(dataModel=>dataModel.id) }})
        
        const statusCounts: { [key: string]: { total: number, secondary: string} }[] = [];

        Array.from(uniqueStatuses).map(status => {
            //@ts-ignore
            const totalCount = dataRecords.reduce((count, dataRecord) => dataRecord.fields['Status'] === status ? count + 1 : count, 0)
            const secondaryCount = (objectNames.map(objectName=> {
                //@ts-ignore
                return `${objectName}: ${dataRecords.reduce((count, dataRecord) => dataRecord.fields['Status'] === status && dataRecord.objectName === objectName ? count + 1 : count, 0)}`
            })).join(', ');
            statusCounts.push({[status]: { total: totalCount, secondary: secondaryCount}});
        })
        
        res.status(200).send(statusCounts);
    }
);

export { router as getStatuses };
