import express, {Request, Response} from "express";
import {body, validationResult} from "express-validator";

import {Company} from "../../models/company";
import {validateRequest} from "../../middleware/validate-request";
import {BadRequestError} from "../../errors/bad-request-error";
import {currentUser} from "../../middleware/current-user";
import {requireAuth} from "../../middleware/require-auth";
import {User} from "../../models/user";
import jwt from 'jsonwebtoken';
import {UserToCompany} from "../../models/user-company";
import {Datamodel, DataType} from "../../models/data-model";
import {logActivity} from "../../helper/log";

const router = express.Router();

router.post(
  "/api/company/new",
  currentUser,
  requireAuth,
  [
    body("companyName")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Company Name must be between 3 and 100 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    try {
      const { companyName, industry, country, timeZone, address } = req.body;
      const email = req.currentUser?.email;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new BadRequestError("Invalid User");
      }
      const company = await Company.build({ companyName, industry, country, timeZone, address });
      company.save();

      existingUser.company = company.id;
      // Update User with company ID
      await existingUser.save();

      // Create UserToCompany
      const userToCompany = UserToCompany.build({ user: existingUser.id, company: company.id });
      await userToCompany.save();
      // Create Individual Account Data Model
      const individualAccountDataModel = Datamodel.build({
            name: "IndividualAccount",
            label: "Account",
            prefix: "IA",
            description: "Individual Account Model",
            company: company.id,
            createdBy: existingUser.id,
            primaryKeys: "Email",
            secondaryKeys: "Phone",
            type: DataType.object,
            properties: {
                Salutation: {
                    type: DataType.string,
                    required: true
                },
                FirstName: {
                  type: DataType.string,
                  required: true
                },
                LastName: {
                  type: DataType.string,
                  required: true
                },
                DateOfBirth: {
                  type: DataType.date,
                  required: true
                },
                Email: {
                    type: DataType.string,
                    required: true
                },
                Phone: {
                    type: DataType.string,
                    required: true
                },
                Address: {
                  type: DataType.object,
                  properties:{
                    HouseNumber: {
                      type: DataType.string,
                      required: true
                    },
                    Street: {
                      type: DataType.string
                    },
                    TownOrCity: {
                      type: DataType.string,
                      required: true
                    },
                    PostCode: {
                      type: DataType.string,
                      required: true
                    },
                    Country: {
                      type: DataType.string,
                      required: true
                    }
                  }
                },
                TransUnion: {
                    type: DataType.reference,
                    ref: 'TransUnion'
                },
                TrustLoop: {
                    type: DataType.reference,
                    ref: 'TrustLoop'
                },
                Consent: {
                    type: DataType.reference,
                    ref: 'Consent'
                }
            }
      });

      // Create Business Account Data Model
      const businessAccountDataModel = Datamodel.build({
            name: "BusinessAccount",
            label: "Account",
            prefix: "BA",
            description: "Business Account Model",
            company: company.id,
            createdBy: existingUser.id,
            primaryKeys:"",
            type: DataType.object,
            properties: {
                BusinessName: {
                    type: DataType.string,
                    required: true
                },
                Type: {
                    type: DataType.string
                },
                DateOfEstablishment: {
                    type: DataType.date,
                    required: true
                },
                Address: {
                    type: DataType.object,
                    properties: {
                        HouseNumber: {
                            type: DataType.string
                        },
                        Street: {
                            type: DataType.string
                        },
                        TownOrCity: {
                            type: DataType.string
                        },
                        PostCode: {
                            type: DataType.string
                        },
                        Country: {
                            type: DataType.string
                        }
                    }
                },
                DirectorsOrShareholders: {
                    type: [DataType.reference],
                    ref: "IndividualAccount",
                    required: true
                }
            }
        });

      // Create Application Data Model
      const applicationDataModel = Datamodel.build({
        name: "Application",
        label: "Application",
        prefix: "APP",
        description: "Application Model",
        company: company.id,
        createdBy: existingUser.id,
        primaryKeys: "",
        type: DataType.object,
        properties: {
          LoanAmount: {
            type: DataType.integer
          },
          Term: {
            type: DataType.integer
          },
          LoanPurpose: {
            type: DataType.string
          },
          LoanManagementPlan: {
            type: DataType.boolean
          },
          PaymentDate: {
            type: DataType.string
          },
          Email: {
            type: DataType.string
          },
          PhoneNumber: {
            type: DataType.string
          },
          MartialStatus: {
            type: DataType.string
          },
          NumberOfDependent: {
            type: DataType.integer
          },
          TimeAtAddress: {
            type: DataType.object,
            properties: {
              Years: {
                type: DataType.integer
              },
              Months: {
                type: DataType.integer
              }
            }
          },
          Finances: {
            type: DataType.object,
            properties: {
              EmploymentStatus: {
                  type: DataType.string
              },
              Employer: {
                type: DataType.string
              },
              Occupation: {
                type: DataType.string
              },
              TimeInEmployment: {
                type: DataType.object,
                properties: {
                  Years: {
                    type: DataType.integer
                  },
                  Months: {
                    type: DataType.integer
                  }
                }
              },
              NetMonthlyIncome: {
                type: DataType.string
              },
              MonthlyPensionIncome: {
                type: DataType.string
              },
              MonthlyBenefitsIncome: {
                type: DataType.string
              },
              AnyOtherIncome: {
                type: DataType.string
              }
            }
          },
          MonthlyOutgoings: {
            type: DataType.object,
            properties: {
              MortgageOrRent: {
                type: DataType.string
              },
              CreditCards: {
                type: DataType.string
              },
              Loans: {
                type: DataType.string
              },
              CouncilTax: {
                type: DataType.string
              },
              UtilityBills: {
                type: DataType.string
              },
              Telecommunications: {
                type: DataType.string
              },
              Insurance: {
                type: DataType.string
              },
              CarExpenses: {
                type: DataType.string
              },
              ShoppingOrGeneralPurchases: {
                type: DataType.string
              },
              HomeServices: {
                type: DataType.string
              },
              Entertainment: {
                type: DataType.string
              },
              Subscriptions: {
                type: DataType.string
              },
              Gambling: {
                type: DataType.string
              },
              FinancialInvestments: {
                type: DataType.string
              },
              OneOffPurchases: {
                type: DataType.string
              },
              Other: {
                type: DataType.string
              }
            }
          },
          Status: {
            type: DataType.string
          },
          IndividualAccount: {
            type: DataType.reference,
            ref: 'IndividualAccount'
          },
          // BusinessAccount: {
          //   type: DataType.reference,
          //   ref: 'BusinessAccount'
          // },
        }
      });

      const contractDataModel = Datamodel.build({
        name: "Contract",
        label: "Contract",
        prefix: "CTR",
        description: "Contract Model",
        company: company.id,
        createdBy: existingUser.id,
        primaryKeys: "",
        type: DataType.object,
        properties: {
          ApplicationId: {
            type: DataType.reference,
            ref: 'Application'
          },
          AccountId: {
            type: DataType.reference,
            ref: 'IndividualAccount'
          },
          Product: { // test
            type: DataType.string
          },
          FacilityAmount : {
            type: DataType.integer
          },
          FacilityStartDate: {
            type: DataType.date
          },
          FacilityDuration: {
            type: DataType.integer
          },
          FacilityEndDate: {
            type: DataType.date
          },
          InterestCalculation: {
            type: DataType.string
          },
          DailyRate: {
            type: DataType.decimal
          },
          AnnualFlat: {
            type: DataType.decimal,
          },
          APR: {
            type: DataType.decimal,
          },
          MonthlyCollectionDate: {
            type: DataType.date,
          },
          MinimumMonthlyAmount: {
            type: DataType.integer
          },
          ZeroDownPeriod: {
            type: DataType.integer
          },
          Status: {
            type: DataType.string
          },
          DocumentId: {
            type: DataType.string
          },
          DocumentStatus: {
            type: DataType.string
          },
          VRPConsentId: {
            type: DataType.string
          }
        }
      });

      const transactionDataModel = Datamodel.build({
        name: "Transaction",
        label: "Transaction",
        prefix: "TAN",
        description: "Transaction Model",
        company: company.id,
        createdBy: existingUser.id,
        primaryKeys: "",
        type: DataType.object,
        properties: {
          MoneyIn: {
            type: DataType.decimal
          },
          MoneyOut: {
            type: DataType.decimal
          },
          StartingBalance: {
            type: DataType.decimal
          },
          EndingBalance: {
            type: DataType.decimal
          },
          FacilityAvailable: {
            type: DataType.decimal
          },
          Interest: {
            type: DataType.decimal
          },
          InterestBalance: {
            type: DataType.decimal
          },
          InterestBalanceAfterRepayment: {
            type: DataType.decimal
          },
          TotalOutstanding: {
            type: DataType.decimal
          },
          RepaymentTowardsFacility: {
            type: DataType.decimal
          },
          ContractId: {
            type: DataType.reference,
            ref: 'Contract'
          },
          PaymentId: {
            type: DataType.string,
          },
          Type: {
            type: DataType.string,
          },
          VRPId: {
            type: DataType.string
          },
          Comments: {
            type: DataType.string
          },
        }
      });

      await individualAccountDataModel.save();
      await businessAccountDataModel.save();
      await applicationDataModel.save();
      await contractDataModel.save();
      await transactionDataModel.save();

      const userJwt = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          token_version: existingUser.token_version,
          companyId: existingUser.company,
          roles: existingUser.roles.toString()
        },
        process.env.JWT_KEY!
      );
      // Store it on session object
      req.session = {
        jwt: userJwt,
      };
      res.status(201).send(company);

    } catch (error) {
      console.log((error as Error).message);
      console.log((error as Error).stack);
      throw error;
    }
  }
);

export { router as createCompanyRouter };
