export type TrustloopTransaction = {
    account_id: string;
    transaction_id: string;
    transaction_reference: string;
    credit_debit_indicator: "Credit";
    value_date_time: string;
    amount: number;
    currency: string;
    balance_amount: number;
    balance_currency: string;
    category: string;
    subcategory: string;
    merchant: string;
};

export type TrustloopGetTransactionResponse = {
    transactions: TrustloopTransaction[];
    total: number;
};

// export type TrustloopAnalyticsOverviewResponse = {
//     "DaysInRange": number;
//     "EarliestDate": string;
//     "LastDate": string;
//     "CurrentBalance": number;
//     "IsOverdraftNow": boolean;
//     "LastOverdraftDate": string;
//     "OverdraftDaysQty": number;
//     "OverdraftDaysPct": number;
//     "AvgLoanRepayment": number;
//     "AvgMonthlyMean": number;
//     "AvgMonthlyMean3Months": number;
// }
//
// export type TrustLoopAnalyticsSumOfIncome = {
//     "month": string,
//     "amount_sum": number
// }
//
// export type TrustLoopAnalyticsSumLoanQty = {
//     "month": string,
//     "qty": number
// }
//
// export type TrustLoopAnalyticsIncomeStreams = {
//     "month": string,
//     "stream_id": string,
//     "amount_sum": number,
//     "qty": number
// }
//
// export type TrustLoopAnalyticsIncomeStreamsAvg = {
//     "stream_id": string,
//     "avg_amount": number
// }
//
// export type TrustLoopAnalyticsSubCategory = {
//     "Subcategory": string,
//     "Amounts": TrustLoopAnalyticsSumOfIncome[]
// }
//
// export type TrustLoopAnalyticsIncomeSummary = {
//     "sum_of_income": TrustLoopAnalyticsSumOfIncome[],
//     "first_last_month_pct_change": number,
//     "avg_monthly_mean": number,
//     "AvgMonthlyMean3Months": number,
//     "most_recent_income_pct": number,
//     "loans_taken": number,
//     "sum_loan_qty": TrustLoopAnalyticsSumLoanQty[],
//     "sum_loan_amount": TrustLoopAnalyticsSumOfIncome[],
//     "most_recent_loan": string,
//     "income_streams": TrustLoopAnalyticsIncomeStreams[],
//     "income_streams_avg": TrustLoopAnalyticsIncomeStreamsAvg[],
//     "IncomeMonthAmounts": null,
//     "LastKnownEmployer": string,
//     "Subcategories": TrustLoopAnalyticsSubCategory[]
// }
//
// export type TrustloopGetAnalyticsResponse = {
//     "consent_id": string;
//     "created_at": string;
//     "Overview": TrustloopAnalyticsOverviewResponse;
//     "income_summary": TrustLoopAnalyticsIncomeSummary
// };

export type TrustloopGetAnalyticsRequest = {
    "blocks": string[]
};

export type TrustLoopAnalyticsResponse = {
    "consent_id": string,
    "created_at": string,
    "income_summary": {
        "sum_of_income": [
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            }
        ],
        "first_last_month_pct_change": number,
        "avg_monthly_mean": number,
        "AvgMonthlyMean3Months": number,
        "most_recent_income_pct": number,
        "loans_taken": number,
        "sum_loan_qty": [
            {
                "month": string,
                "qty": number
            },
            {
                "month": string,
                "qty": number
            },
            {
                "month": string,
                "qty": number
            },
            {
                "month": string,
                "qty": number
            }
        ],
        "sum_loan_amount": [
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            }
        ],
        "most_recent_loan": string,
        "income_streams": [
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            },
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            },
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            },
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            },
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            },
            {
                "month": string,
                "stream_id": string,
                "amount_sum": number,
                "qty": number
            }
        ],
        "income_streams_avg": [
            {
                "stream_id": string,
                "avg_amount": number
            },
            {
                "stream_id": string,
                "avg_amount": number
            }
        ],
        "IncomeMonthAmounts": null,
        "LastKnownEmployer": string,
        "Subcategories": [
            {
                "Subcategory": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ]
            },
            {
                "Subcategory": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ]
            }
        ]
    },
    "behaviours": {
        "is_overdraft_now": true,
        "last_overdraft_date": string,
        "overdraft_days_qty": number,
        "overdraft_days_pct": number
    },
    "expenditure": {
        "CategoriesInfo": [
            {
                "Category": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ],
                "Subcategories": [
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    }
                ]
            },
            {
                "Category": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ],
                "Subcategories": [
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    },
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    }
                ]
            },
            {
                "Category": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ],
                "Subcategories": [
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    },
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    }
                ]
            },
            {
                "Category": string,
                "Amounts": [
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    },
                    {
                        "month": string,
                        "amount_sum": number
                    }
                ],
                "Subcategories": [
                    {
                        "Subcategory": string,
                        "Amounts": [
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            },
                            {
                                "month": string,
                                "amount_sum": number
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "expenditure_summary": {
        "avg_monthly_expenditure": number,
        "loans_qty": number,
        "avg_repayment_to_loans": [
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            },
            {
                "month": string,
                "amount_sum": number
            }
        ]
    },
    "utilities": {
        "utilities_sum": [
            {
                "month": string,
                "amount_sum": number,
                "subcategory": string
            },
            {
                "month": string,
                "amount_sum": number,
                "subcategory": string
            },
            {
                "month": string,
                "amount_sum": number,
                "subcategory": string
            },
            {
                "month": string,
                "amount_sum": number,
                "subcategory": string
            }
        ],
        "UtilitiesByMerchant": {}
    },
    "transactions_summary": {
        "current_balance": number,
        "monthly_avg_balance": [
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            }
        ],
        "monthly_lowest_balance": [
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            }
        ],
        "days_since_last_income": number
    },
    "affordability": {
        "Spending": {
            "Debits": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "Credits": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "Net": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ]
        },
        "EndMonthBalances": [
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            },
            {
                "month": string,
                "balance": number
            }
        ],
        "Outgoing": {
            "EssentialExpenditure": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "BasicQualityOfLiving": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "DiscretionarySpending": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "CommittedExpenditure": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "Excluded": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ]
        },
        "Summary": {
            "regular_affordability": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ],
            "total_affordability": [
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                },
                {
                    "month": string,
                    "amount_sum": number
                }
            ]
        }
    },
    "transactions": {
        "days_in_range": number,
        "earliest_date": string,
        "last_date": string
    },
    "Overview": {
        "DaysInRange": number,
        "EarliestDate": string,
        "LastDate": string,
        "CurrentBalance": number,
        "IsOverdraftNow": true,
        "LastOverdraftDate": string,
        "OverdraftDaysQty": number,
        "OverdraftDaysPct": number,
        "AvgLoanRepayment": number,
        "AvgMonthlyMean": number,
        "AvgMonthlyMean3Months": number
    }
}

export type PSUInfo = {
    salutation: string;
    first_name: string;
    last_name: string;
    postcode: string;
    address_line_1: string;
    address_line_2?: string;
    town: string;
    county?: string;
    account_holders_num?: number;
    birth_date: string;
    phone_number: string;
    company_name?: string;
    company_number?: string;
};

export type TrustlooopNewConsentRequestParams = {
    psu_email: string;
    exp_notification?: boolean;
    business?: boolean;
    psu_info: PSUInfo;
    redirect_url?: string;
    data_visibility_lifetime_days: number;
};

export type TrustlooopNewConsentRequestResponse = {
    consent_id: string;
    confirm_link: string;
};

export type SnakeToCamelCase<T extends Record<string, any>> = T extends object
    ? {
        [K in keyof T as SnakeToCamelCaseKey<K & string>]: SnakeToCamelCase<T[K]>;
    }
    : T;

export type SnakeToCamelCaseKey<K extends string> =
    K extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}${Capitalize<SnakeToCamelCaseKey<Rest>>}`
    : K;

export type NewConsentReqParams =
    SnakeToCamelCase<TrustlooopNewConsentRequestParams>;

export enum TrustloopConsentStatus {
    ConsentDataShared = "consent-data-shared",
    ConsentDataReceived = "consent-data-received",
    Pending = "pending",
    Rejected = "rejected",
    RequestExpired = "request-expired",
    ConsentExpired = "consent-expired",
    Revoked = "revoked",
}

export type TrustloopGetTransactionsQueryParams = {
    sort_by: "by_date" | "by_amount";
    desc: boolean;
    limit: number;
    offset: number;
    from: string; // yy-mm-dd format
    till: string; // yy-mm-dd format
};

export interface Consent {
    id: string;
    psu_email: string;
    customer_id: string;
    status: string;
    created_at: string;
    lifetime: number;
    bank: string;
    customer: {
        first_name: string;
        last_name: string;
        company_name: string;
    };
    exp_notification?: boolean;
    business?: boolean;
    psu_info: {
        salutation: string;
        first_name: string;
        last_name: string;
        postcode: string;
        address_line_1: string;
        address_line_2?: string;
        town: string;
        county?: string;
        account_holders_num?: number;
        birth_date: string;
        phone_number: string;
        company_name?: string;
        company_number?: string;
    };
}

export interface Party {
    acc_id?: string;
    party: {
        party_id: string;
        party_type: string;
        name: string;
        email: string;
        address: {
            address_type?: string;
            street_name?: string;
            building_number?: string;
            post_code?: string;
            town_name?: string;
            country?: string;
        };
    };
}

export interface Summary {
    consent_id: string;
    acc_type: string;
    earliest_date: string;
    latest_date: string;
    days_qty: number;
    trans_qty: number;
    overdraft_days_qty: number;
    created_at: string;
    credits: {
        qty: number;
        avg_amount: number;
        max: number;
        min: number;
        sum: number;
    };
    debits: {
        qty: number;
        avg_amount: number;
        max: number;
        min: number;
        sum: number;
    };
    balance: {
        avg: number;
        max: number;
        min: number;
    };
}

export interface TrustloopGetConsentByIdResponse {
    consent: Consent;
    party: Party;
    summary?: Summary;
}

export type TrustloopGetAuthTokenResposne = {
    access_token: string;
};
