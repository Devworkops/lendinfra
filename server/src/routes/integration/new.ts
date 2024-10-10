import express, { Request, Response } from "express";
import { validationResult } from "express-validator";

import { validateRequest } from "../../middleware/validate-request";
import { requireAuth } from "../../middleware/require-auth";
import { currentUser } from "../../middleware/current-user";
import { BadRequestError } from "../../errors/bad-request-error";
import { Integration } from "../../models/integration";
import { Company } from "../../models/company";
import { Datamodel, DatamodelDoc, DataType } from "../../models/data-model";
import { User } from "../../models/user";
import { logActivity } from "../../helper/log";
import { notfication } from "../../helper/notification";

const router = express.Router();

router.post(
    "/api/integration/new",
    currentUser,
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);

            const companyId = req?.currentUser?.companyId;
            const currentUserId = req.currentUser?.id;
            // Check valid company
            const existingCompany = await Company.findById(companyId);

            if (!existingCompany) {
                await notfication(companyId, currentUserId, "intigration", "Company doesn't exist", '');
                throw new BadRequestError("Company doesn't exist");
            }

            const existingUser = await User.findById(currentUserId);
            if (!existingUser) {
                await notfication(companyId, currentUserId, "intigration", "User doesn't exist", '');
                throw new BadRequestError("User doesn't exist");
            }

            const { name, description, logo, metaFields, type, actions } = req.body;

            // Check if same configuration is present or not
            const existingIntegration = await Integration.find({ name, company: companyId });

            if (existingIntegration.length > 0) {
                await notfication(companyId, currentUserId, "intigration", "Invalid Configuration for "+ req.body.name, '' );
                throw new BadRequestError("Invalid Configuration");
            }

            const integration = Integration.build({ name, description, logo, metaFields, type, company: companyId, actions });

            const existingDataModel = await Datamodel.findOne({ name: name, company: companyId });

            if (!existingDataModel) {
                let integrationDataModel;
                if (name == 'TransUnion') {
                    integrationDataModel = Datamodel.build({
                        name: "TransUnion",
                        label: "TransUnion",
                        prefix: "TU",
                        description: "Integrated TransUnion Model",
                        company: existingCompany.id,
                        createdBy: existingUser.id,
                        primaryKeys: "account",
                        type: DataType.object,
                        properties: {
                            creditReport: {
                                type: DataType.object,
                                properties: {
                                    creditScore: {
                                        type: DataType.integer
                                    },
                                    searches: {
                                        type: DataType.object,
                                        properties: {
                                            totalSearches3Months: {
                                                type: DataType.integer
                                            },
                                            totalSearches12Months: {
                                                type: DataType.integer
                                            },
                                            totalHomeCreditSearches3Months: {
                                                type: DataType.integer
                                            }
                                        }
                                    },
                                    judgments: {
                                        type: DataType.object,
                                        properties: {
                                            totalActive: {
                                                type: DataType.integer
                                            },
                                            totalSatisfied: {
                                                type: DataType.integer
                                            }
                                        }
                                    },
                                    bais: {
                                        type: DataType.object,
                                        properties: {
                                            totalDischarged: {
                                                type: DataType.integer
                                            },
                                            currentlyInsolvent: {
                                                type: DataType.integer
                                            }
                                        }
                                    },
                                    notices: {
                                        type: DataType.object,
                                        properties: {
                                            nocFlag: {
                                                type: DataType.integer
                                            },
                                            totalDisputes: {
                                                type: DataType.integer
                                            }
                                        }
                                    },
                                    lastSyncedDate: {
                                        type: DataType.date
                                    },
                                    account: {
                                        type: DataType.string
                                    },
                                    response: {
                                        type: DataType.object
                                    }
                                }
                            }
                        }
                    });
                    await integrationDataModel.save();
                }
                if (name == 'TrustLoop') {
                    integrationDataModel = Datamodel.build({
                        name: "TrustLoop",
                        label: "TrustLoop",
                        prefix: "TL",
                        description: "Integrated TrustLoop Model",
                        company: existingCompany.id,
                        createdBy: existingUser.id,
                        primaryKeys: "account",
                        type: DataType.object,
                        properties: {
                            consent_id: { type: DataType.string },
                            confirm_link: { type: DataType.string },
                            created_at: { type: DataType.string },
                            income_summary: {
                                type: DataType.object,
                                properties: {
                                    sum_of_income: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            amount_sum: { type: DataType.integer }
                                        }
                                    },
                                    first_last_month_pct_change: { type: DataType.integer },
                                    avg_monthly_mean: { type: DataType.integer },
                                    AvgMonthlyMean3Months: { type: DataType.integer },
                                    most_recent_income_pct: { type: DataType.integer },
                                    loans_taken: { type: DataType.integer },
                                    sum_loan_qty: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            qty: { type: DataType.integer }
                                        }
                                    },
                                    sum_loan_amount: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            amount_sum: { type: DataType.integer }
                                        }
                                    },
                                    most_recent_loan: { type: DataType.string },
                                    income_streams: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            stream_id: { type: DataType.string },
                                            amount_sum: { type: DataType.integer },
                                            qty: { type: DataType.integer }
                                        }
                                    },
                                    income_streams_avg: {
                                        type: DataType.array,
                                        properties: {
                                            stream_id: { type: DataType.string },
                                            avg_amount: { type: DataType.integer }
                                        }
                                    },
                                    IncomeMonthAmounts: { type: DataType.string },
                                    LastKnownEmployer: { type: DataType.string },
                                    Subcategories: {
                                        type: DataType.array,
                                        properties: {
                                            Subcategory: { type: DataType.string },
                                            Amounts: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            }
                                        }
                                    }, 
                                    AvgLast6MonthPaycheck: { type: DataType.integer },
                                    LastPaycheckIncome: {
                                        type: DataType.object,
                                        properties: {
                                            month: { type: DataType.string },
                                            amount_sum: { type: DataType.integer }
                                        }
                                    },
                                    Returned: {
                                        type: DataType.object,
                                        properties: {
                                            ReturnsCountLast3months: { type: DataType.integer },
                                            ReturnsSumLast3months: { type: DataType.integer }
                                        }
                                    }
                                }
                            },
                            behaviours: {
                                type: DataType.object,
                                properties: {
                                    is_overdraft_now: { type: DataType.boolean },
                                    last_overdraft_date: { type: DataType.string },
                                    overdraft_days_qty: { type: DataType.integer },
                                    overdraft_days_pct: { type: DataType.integer },
                                    overdraft_days_pcf_3_months: { type: DataType.integer },
                                    overdraft_days_pcf_6_months: { type: DataType.integer }
                                }
                            },
                            expenditure: {
                                type: DataType.object,
                                properties: {
                                    CategoriesInfo: {
                                        type: DataType.array,
                                        properties: {
                                            Category: { type: DataType.string },
                                            Amounts: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            Subcategories: {
                                                type: DataType.array,
                                                properties: {
                                                    Subcategory: { type: DataType.string },
                                                    Amounts: {
                                                        type: DataType.array,
                                                        properties: {
                                                            month: { type: DataType.string },
                                                            amount_sum: { type: DataType.integer }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    Entertainment: {
                                        type: DataType.object, 
                                        properties: {
                                            GamblingOver6MonthComparingToAllIncome: { type: DataType.integer },
                                            GamblingOver6MonthComparingToPaycheckIncome: { type: DataType.integer },
                                            MaxGamblingMonthlyExpenditures: {
                                                type: DataType.array, 
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            expenditure_summary: {
                                type: DataType.object,
                                properties: {
                                    avg_monthly_expenditure: { type: DataType.integer },
                                    loans_qty: { type: DataType.integer },
                                    avg_repayment_to_loans: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            amount_sum: { type: DataType.integer }
                                        }
                                    }
                                }
                            },
                            utilities: {
                                type: DataType.object,
                                properties: {
                                    utilities_sum: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            amount_sum: { type: DataType.integer },
                                            subcategory: { type: DataType.string }
                                        }
                                    },
                                    UtilitiesByMerchant: {
                                        type: DataType.object,
                                        properties: {}
                                    }
                                }
                            },
                            transactions_summary: {
                                type: DataType.object,
                                properties: {
                                    current_balance: { type: DataType.integer },
                                    monthly_avg_balance: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            balance: { type: DataType.integer }
                                        }
                                    },
                                    monthly_lowest_balance: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            balance: { type: DataType.integer }
                                        }
                                    },
                                    days_since_last_income: { type: DataType.integer }
                                }
                            },
                            affordability: {
                                type: DataType.object,
                                properties: {
                                    Spending: {
                                        type: DataType.object,
                                        properties: {
                                            Debits: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            Credits: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            Net: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            }
                                        }
                                    },
                                    EndMonthBalances: {
                                        type: DataType.array,
                                        properties: {
                                            month: { type: DataType.string },
                                            balance: { type: DataType.integer }
                                        }
                                    },
                                    Outgoing: {
                                        type: DataType.object,
                                        properties: {
                                            EssentialExpenditure: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            BasicQualityOfLiving: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            DiscretionarySpending: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            CommittedExpenditure: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            Excluded: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            }
                                        }
                                    },
                                    Summary: {
                                        type: DataType.object,
                                        properties: {
                                            regular_affordability: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            },
                                            total_affordability: {
                                                type: DataType.array,
                                                properties: {
                                                    month: { type: DataType.string },
                                                    amount_sum: { type: DataType.integer }
                                                }
                                            }
                                        }
                                    }, 
                                    TransfersSummary: {
                                        type: DataType.object,
                                        properties: {
                                            TransferPerPaychecks6Months: { type: DataType.integer },
                                            TransferPerPaychecks3Months: { type: DataType.integer }
                                        }
                                    }
                                }
                            },
                            transactions: {
                                type: DataType.object,
                                properties: {
                                    days_in_range: { type: DataType.integer },
                                    earliest_date: { type: DataType.string },
                                    last_date: { type: DataType.string }
                                }
                            },
                            Overview: {
                                type: DataType.object,
                                properties: {
                                    DaysInRange: { type: DataType.integer },
                                    EarliestDate: { type: DataType.string },
                                    LastDate: { type: DataType.string },
                                    CurrentBalance: { type: DataType.integer },
                                    IsOverdraftNow: { type: DataType.boolean },
                                    LastOverdraftDate: { type: DataType.string },
                                    OverdraftDaysQty: { type: DataType.integer },
                                    OverdraftDaysPct: { type: DataType.integer },
                                    AvgLoanRepayment: { type: DataType.integer },
                                    AvgMonthlyMean: { type: DataType.integer },
                                    AvgMonthlyMean3Months: { type: DataType.integer },
                                    CountOfRepaymentLast3Month: { type: DataType.integer },
                                    CountOfCreditsLess1000Gbp: { type: DataType.integer }
                                }
                            },
                            account: {
                                type: DataType.string
                            }
                        }
                    });
                    const consentDataModel = Datamodel.build({
                        name: "Consent",
                        label: "Consent",
                        prefix: "Consent",
                        description: "Consent TrustLoop Model",
                        company: existingCompany.id,
                        createdBy: existingUser.id,
                        primaryKeys: "account",
                        type: DataType.object,
                        properties: {
                            consent_id: {
                                type: DataType.string
                            },
                            confirm_link: {
                                type: DataType.string
                            },
                            account: {
                                type: DataType.string
                            }
                        }
                    });
                    await integrationDataModel.save();
                    await consentDataModel.save();
                }

            }

            await integration.save();

            res.status(201).send(integration);
        } catch (error) {
            console.log((error as Error).message);
            console.log((error as Error).stack);
            await notfication(req?.currentUser?.companyId, req.currentUser?.id, "intigration", "Something went wrong with "+ req.body.name +" configuration", '');
            throw (error as Error).message;
        }
    }
);

export { router as createIntegrationRouter };
