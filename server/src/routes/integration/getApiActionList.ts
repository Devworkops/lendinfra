import express, {Request, Response} from "express";
import { getMetaFieldValue } from "../../helper/integrationSetup";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {ActionAttrs, Integration} from "../../models/integration";
import {logActivity} from "../../helper/log";

// Here we will fetch all action available of a company
const router = express.Router();

router.get(
    "/api/integration/apis/",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      try {

        const companyId = req?.currentUser?.companyId;

        // Get existing Integrations
        const integrations = await Integration.find({company: {$in:[companyId, '', undefined]}, isActive: true});
        
        let actions:ActionAttrs[]=[];
        if(integrations){
            for(let integration of integrations){
                if(integration.actions&&integration.actions.length>0)
                    actions.push(...integration.actions);
            }
        }

        return res.send(actions);
      } catch (error) {
        console.log("error",error);
        return res.send({message: error});
      }
    }
);

export {router as allApisRouter};
