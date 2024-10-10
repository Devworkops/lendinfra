import { Request, Response } from "express";
import { FilterQuery, PaginateOptions } from "mongoose";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord, DataRecordDoc } from "../../models/data-record";
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
  objectName?: string,
  options?: string,
  pageToken?: string,
  maxPageSize?: string,
}

router.get(
  "/api/datarecord/all/:companyId?",
  currentUser,
  requireAuth,
  async (
    req: Request<RequestParams, unknown, unknown, RequestQuery>,
    res: Response) => {
    const { startDate, endDate, status, objectName, options } = req.query;
    const { pageToken, maxPageSize = defaultMaxPageSize } = req.query;
    company_id = req?.currentUser?.companyId;
    user_id = req?.currentUser?.id;
    let query: FilterQuery<DataRecordDoc> = {
      company: req.params.companyId,
      isActive: true,
    };

    if(status && status!='All') {
      query = {
          ...query,
          'fields.Status': status,
        };
      }

    try {
      if (!query.company) {
        return res.sendStatus(400);
      }
      if (pageToken && parseInt(pageToken) < 1) {
        return res.sendStatus(400);
      }

      if (maxPageSize && parseInt(maxPageSize) < 1) {
        return res.sendStatus(400);
      }

      if (!isEmpty(startDate) && !isEmpty(endDate))
        query.createdAt = { $gte: startDate, $lte: endDate }

      if (!isEmpty(objectName) && objectName != 'All')
        query.objectName = objectName

      const offset = pageToken && parseInt(pageToken) > 1 ? (parseInt(pageToken) - 1) * parseInt(maxPageSize) : 0
      const limit = parseInt(maxPageSize)

      const paginationOptions: PaginateOptions = {
        ...(pageToken ? {
          offset,
          limit,
        } : {
          pagination: false,
        }),
        sort: {
          createdAt: -1,
          // _id: -1,
        },
      };

      try {
        const {
          docs,
          hasNextPage,
          totalPages,
          totalDocs,
        } = await DataRecord.paginate(query, paginationOptions);

        return res.send({
          results: docs,
          hasNextPage,
          totalPages,
          totalResults: totalDocs,
        });
      } catch {
        return res.sendStatus(500);
      }

    } catch (error) {
      company_id = req?.currentUser?.companyId;
      user_id = req?.currentUser?.id;
      console.log(error);
      return res.send({ message: error });
    }
  }
);

export { router as allDataRecordRouter };
