import { Request, Response } from "express";
import { FilterQuery, PaginateOptions } from "mongoose";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { Datamodel, DatamodelDoc } from "../../models/data-model";
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
  name?: string,
  label?: string,
  createdBy?: string,
  isActive?: boolean,
  options?: string,
  pageToken?: string,
  maxPageSize?: string,
}

router.get(
  "/api/datamodel/all/:companyId?",
  currentUser,
  requireAuth,
  async (
    req: Request<RequestParams, unknown, unknown, RequestQuery>,
    res: Response) => {
    const { name, label, createdBy, isActive, options } = req.query;
    const { pageToken, maxPageSize = defaultMaxPageSize } = req.query;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;

    let query: FilterQuery<DatamodelDoc> = {
      company: req.params.companyId,
      isActive: true
    };

    try {
      if (!query.company) {
        return res.sendStatus(400);
      }
      if (label) {
        query.label = label
      }
      if (name) {
        query.name = name
      }
      if (pageToken && parseInt(pageToken) < 1) {
        return res.sendStatus(400);
      }

      if (maxPageSize && parseInt(maxPageSize) < 1) {
        return res.sendStatus(400);
      }

      const pathsToPopulate = [''];
      const offset = pageToken && parseInt(pageToken) > 1 ? (parseInt(pageToken) - 1) * parseInt(maxPageSize) : 0
      const limit = parseInt(maxPageSize) ? parseInt(maxPageSize) : 100
      await logActivity(company_id, user_id, "DataModel", "Request Query: " + query.toString());
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
        } = await Datamodel.paginate(query, paginationOptions);
        await logActivity(company_id, user_id, "DataModel", "DataModel fetched successfully. " + totalDocs.toString());

        return res.send({
          results: docs,
          hasNextPage,
          totalPages,
          totalResults: totalDocs,
        });
      } catch {
        await logActivity(company_id, user_id, "DataModel", "Error while getting the data model.");
        return res.sendStatus(500);
      }

    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      await logActivity(company_id, user_id, "DataModel", "Error while getting the data model. " + (error as Error).message.toString());
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allDatamodelRouter };
