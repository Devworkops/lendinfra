import { Request, Response } from "express";
import { FilterQuery, PaginateOptions } from "mongoose";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Workflow, WorkflowConfigStatus, WorkflowDoc } from "../../models/workflow";
import { isEmpty } from "lodash";
import { logActivity } from "../../helper/log";

const defaultMaxPageSize = "100";

// Here we will fetch all general ledger for a company
import express from 'express';
const router = express.Router();
let company_id: string | undefined = '';
let user_id: string | undefined = '';

interface RequestParams {
  companyId?: string
}

interface RequestQuery {
  startDate?: Date,
  endDate?: Date,
  status?: string,
  type?: string,
  options?: string,
  pageToken?: string,
  maxPageSize?: string,
  active?: boolean
}

router.get(
  "/api/workflow/all/:companyId?",
  currentUser,
  requireAuth,
  async (
    req: Request<RequestParams, unknown, unknown, RequestQuery>,
    res: Response) => {
    const { startDate, endDate, status, type, options, active } = req.query;
    const { pageToken, maxPageSize = defaultMaxPageSize } = req.query;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;

    const query: FilterQuery<WorkflowDoc> = {
      company: req.params.companyId,
      isActive: active
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

      if (!isEmpty(type) && type != 'All')
        query.type = type

      const pathsToPopulate = [''];

      const offset = pageToken && parseInt(pageToken) > 1 ? (parseInt(pageToken) - 1) * parseInt(maxPageSize) : 0
      const limit = parseInt(maxPageSize)
      await logActivity(company_id, user_id, "Workflow", "Request Query: " + query.toString());

      const paginationOptions: PaginateOptions = {
        ...(pageToken ? {
          offset,
          limit,
        } : {
          pagination: false,
        }),
        sort: {
          createdAt: -1
        },
      };

      try {
        const {
          docs,
          hasNextPage,
          totalPages,
          totalDocs,
        } = await Workflow.paginate(query, paginationOptions);
        await logActivity(company_id, user_id, "Workflow", "Workflow fetched successfully: " + totalDocs.toString());

        return res.send({
          results: docs,
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
      await logActivity(company_id, user_id, "Workflow", "Error while fetching Workflows.");
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allWorkflowsRouter };
