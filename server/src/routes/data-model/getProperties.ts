import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { validateRequest } from "../../middleware/validate-request";
import {Datamodel, DatamodelDoc} from "../../models/data-model";
import express from 'express';
import {logActivity} from "../../helper/log";

const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

// @ts-ignore
router.get(
    "/api/dataModel/getProperties",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            const {dataModelName} = req.query;
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            let dataModelMap = {};
            // get base data model name as query parameter
            // // write recursive code to fetch all the fields name
            async function getProperties(dataModel: string) {
                const baseDataModel = await Datamodel.findOne({
                    isActive: true,
                    company: company_id,
                    name: dataModel
                });

                if (baseDataModel) {
                    const properties = baseDataModel.properties;

                    await logActivity(company_id, user_id, "DataModel", "Get DataModel for " + dataModel);

                    for (const key in properties) {
                        if (properties.hasOwnProperty(key)) {
                            // @ts-ignore
                            if (properties[key].type === 'reference') {
                                // @ts-ignore
                                await getProperties(properties[key].ref); // Recursively call getProperties
                            } else {
                                // @ts-ignore
                                dataModelMap[dataModel + "." + key] = properties[key];
                            }
                        }
                    }
                }
            }
            if (dataModelName){
                await getProperties(dataModelName.toString());
            }
            await logActivity(company_id, user_id, "DataModel", dataModelMap.toString());
            res.status(201).send(dataModelMap);
        } catch (error) {
            company_id = req?.currentUser?.companyId;
            user_id = req?.currentUser?.id;
            await logActivity(company_id, user_id, "DataModel", "Error while getting the data model property. " + (error as Error).message.toString());
            console.log((error as Error).message);
            console.log((error as Error).stack);
            throw (error as Error).message;
        }
    }
);

export { router as getDataModelGetPropertiesRouter };

