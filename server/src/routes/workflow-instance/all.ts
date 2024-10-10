import { Request, Response } from "express";
import { FilterQuery, PaginateOptions, PopulateOptions } from "mongoose";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { WorkflowInstance, WorkflowInstanceDoc } from "../../models/workflow-instance";
import { isEmpty } from "lodash";
import { logActivity } from "../../helper/log";

const defaultMaxPageSize = "100";

// Here we will fetch all general ledger for a company
const express = require('express');
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

interface RequestParams {
  companyId?: string
}

interface RequestQuery {
  recordId: string
  startDate?: Date,
  endDate?: Date,
  status?: string,
  type?: string,
  options?: string,
  pageToken?: string,
  maxPageSize?: string,
}

router.get(
  "/api/workflow/instance/all/:companyId?",
  currentUser,
  requireAuth,
  async (
    req: Request<RequestParams, unknown, unknown, RequestQuery>,
    res: Response) => {
    const { startDate, endDate, status, type, options, recordId } = req.query;
    const { pageToken, maxPageSize = defaultMaxPageSize } = req.query;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    const query: FilterQuery<WorkflowInstanceDoc> = {
      company: req.params.companyId,
    };

    try {
      if (!query.company) {
        await logActivity(company_id, user_id, "Workflow", "Company not found.");
        return res.sendStatus(400);
      }
      if (pageToken && parseInt(pageToken) < 1) {
        await logActivity(company_id, user_id, "Workflow", "Page Token is less than 1.");
        return res.sendStatus(400);
      }

      if (maxPageSize && parseInt(maxPageSize) < 1) {
        await logActivity(company_id, user_id, "Workflow", "Maximum Page Size is less than 1.");
        return res.sendStatus(400);
      }

      if (!isEmpty(startDate) && !isEmpty(endDate))
        query.createdAt = { $gte: startDate, $lte: endDate }

      if (!isEmpty(status) && status != 'All')
        query.status = status

      if (recordId) {
        query.recordId = recordId;
      }
      const pathsToPopulate : PopulateOptions[] = [{path: 'workflow', select: '-config'}, {path: 'recordId', select: 'recordId'} ];

      const offset = pageToken && parseInt(pageToken) > 1 ? (parseInt(pageToken) - 1) * parseInt(maxPageSize) : 0
      const limit = parseInt(maxPageSize)
      await logActivity(company_id, user_id, "Workflow", "Request Query: " + query.toString());

      const paginationOptions: PaginateOptions = {
        populate: pathsToPopulate,
        select: '-result',
        lean: true,
        ...(pageToken ? {
          offset,
          limit,
        } : {
          pagination: false,
        }),
        sort: {
          updatedAt: -1,
          name: -1,
        },
      };

      try {
        const {
          docs,
          hasNextPage,
          totalPages,
          totalDocs,
        } = await WorkflowInstance.paginate(query, paginationOptions);

        const modifiedResult = docs.map(doc => {
          
          return {
            ...doc,
            //@ts-ignore
            recordId: doc.recordId._id.toString(),
            //@ts-ignore
            recordName: doc.recordId.recordId
          }
        })
        await logActivity(company_id, user_id, "Workflow", "Workflow fetched successfully: " + totalDocs.toString());

        return res.send({
          results: modifiedResult,
          hasNextPage,
          totalPages,
          totalResults: totalDocs,
        });
      } catch {
        await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows.");
        return res.sendStatus(500);
      }

    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows: " + (error as Error).message.toString());
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allWorkflowInstanceRouter };
