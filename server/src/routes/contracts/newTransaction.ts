import { Request, Response } from "express";
import { BadRequestError } from "../../errors/bad-request-error";
import { currentUser } from "../../middleware/current-user";
import { requireAuth } from "../../middleware/require-auth";
import { DataRecord } from "../../models/data-record";
import { Datamodel } from "../../models/data-model";
import { moneyHubClient } from "../../Integrations/Interface/moneyhub/MoneyhubConfig";
import { abs } from "mathjs";
const { ObjectId } = require('mongodb');

const express = require('express');
const router = express.Router();

const withdrawBalance = (amount: number) => {
    // Sending a mail to vidur@mensari.co || vidur@quidfair.com as a notification
    // and after that update the bank's provided payment id in the same transaction
    console.log(`Requesting for withdrawl of amount: ${amount}`)
}
const depositBalance = async (amount: number, vrpId: string, payeeId: string) => {
    try {
        const moneyhub = await moneyHubClient();
        const amountInPence = amount*100;
        const recurringPayment = await moneyhub.makeRecurringPayment({
            recurringPaymentId: vrpId,
            payment: {
              payeeId: payeeId, // optional
              amount: amountInPence,
              payeeRef: "Payee ref",
              payerRef: "Payer ref",
            },
        });

        console.log(recurringPayment);
        return recurringPayment.data;
        // feature: send a mail to both the sides for payment confirmation
    } catch (e: any) {
        console.error("Error occurred while getting recurring payments from customer's bank", e);
        throw new BadRequestError("VRP Request failed");
    }
}

router.post(
    "/api/contract/transaction",
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const data = req.body;

            if (!data) {
                throw new BadRequestError('Input data is missing.');
            }
            console.log(data);

            const contract = await DataRecord.findById(data.Contract)
            let prevTransactions = await DataRecord.find({objectName: "Transaction", company: data.Company, 'fields.ContractId': data.Contract});
            prevTransactions.sort((a: any, b: any) => b.createdAt - a.createdAt);
            const prevTransaction = prevTransactions[0];

            const dataModelDetail = await Datamodel.findOne({name: "Transaction", company: data.Company});
            const dataRecordCount = await DataRecord.find({ objectName: "Transaction", company: data.Company, 'fields.ContractId': data.Contract }).lean().count();
            //@ts-ignore
            const recordId = dataModelDetail?.prefix + ' ' + (dataRecordCount + 1);
            const amount = data.Type === 'Withdraw' ? parseFloat((data.Amount * -1).toFixed(2)) : parseFloat(parseFloat(data.Amount).toFixed(2));
            
            // @ts-ignore
            const startingBalance = parseFloat((prevTransaction?.fields?.EndingBalance || 0).toFixed(2));
            
            let newTransaction;
            // @ts-ignore
            const interestBalance = prevTransaction?.fields.InterestBalance || 0;
            if(data.Type === 'Withdraw') {
                if(abs(amount)  <100) {
                    res.status(400).send({message: "Requested amount less than 100"});
                    return;
                }
                const endingBalance = amount + startingBalance;
                // @ts-ignore
                const facilityAvailable = (prevTransaction?.fields.FacilityAvailable ? prevTransaction?.fields.FacilityAvailable  : contract?.fields.FacilityAmount) + amount;
                // @ts-ignore
                if(facilityAvailable>contract?.fields.FacilityAmount || facilityAvailable<0) {
                    res.status(400).send({message: "Invalid Amount"})
                    return;
                }
                        
                // @ts-ignore
                const balanceIncludingInterest =( prevTransaction?.fields?.BalanceIncludingInterest + amount) || endingBalance;
                newTransaction = new DataRecord({
                    recordId: recordId,
                    company: data.Company,
                    objectName: "Transaction",
                    primaryKey: "",
                    dataModel: dataModelDetail?.id,
                    //@ts-ignore
                    createdBy: ObjectId(req.currentUser?.id),
                    fields: {
                        MoneyOut: amount,
                        StartingBalance: startingBalance,
                        EndingBalance: endingBalance,
                        FacilityAvailable: facilityAvailable,
                        Type: "Withdraw",
                        ContractId: data.Contract,
                        InterestBalance:interestBalance,
                        BalanceIncludingInterest: balanceIncludingInterest,
                        Status:"In Progress",
                    }
                });
                withdrawBalance(abs(amount));
            } else if(data.Type === "Deposit") {
                //@ts-ignore
                const repaymentTowardsFacility = amount + interestBalance; 
                //@ts-ignore
                const endingBalance = parseFloat(((prevTransaction?.fields?.EndingBalance || 0) + repaymentTowardsFacility).toFixed(2));
                //@ts-ignore
                let facilityAvailable = parseFloat((prevTransaction?.fields.FacilityAvailable || contract?.fields.FacilityAmount || 0).toFixed(2));
                //@ts-ignore
                if(facilityAvailable + repaymentTowardsFacility>contract?.fields.FacilityAmount || facilityAvailable + repaymentTowardsFacility<0) {
                    res.status(400).send({message: "Invalid Amount to deposit"})
                    return;
                }

                if(endingBalance === 0 ) {
                    //@ts-ignore
                    facilityAvailable = contract?.fields.FacilityAmount;
                }
                //@ts-ignore
                const vrpData = await depositBalance(repaymentTowardsFacility,contract?.fields.VRPConsentId, data.PayeeId);

                newTransaction = new DataRecord({
                    recordId: recordId,
                    company: data.Company,
                    objectName: "Transaction",
                    primaryKey: "",
                    dataModel: dataModelDetail?.id,
                    //@ts-ignore
                    createdBy: ObjectId(req.currentUser?.id),
                    fields: {
                        MoneyIn: amount,
                        StartingBalance: startingBalance,
                        EndingBalance: endingBalance,
                        FacilityAvailable: facilityAvailable,
                        Type: "Deposit",
                        ContractId: data.Contract,
                        InterestBalance:0,
                        RepaymentTowardsFacility:repaymentTowardsFacility,
                        BalanceIncludingInterest: endingBalance,
                        Status: vrpData.status,
                        PaymentId: vrpData.authRequestId,
                        //@ts-ignore
                        VRPId: contract?.fields.VRPConsentId
                    }
                });        
            } else {
                console.error("Invalid Transaction Type");
                throw new BadRequestError("Invalid transaction type");
            }
            await newTransaction.save();
            res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
        } catch (err) {
            console.error('Error creating transaction:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

export { router as newTransaction };
