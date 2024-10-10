import { Datamodel } from "../models/data-model";
import { DataRecord } from "../models/data-record";

const calculateInterest = async () => {
    try {
        console.log("Calculate interest triggered.");
        const contracts = await DataRecord.find({objectName: "Contract", isActive: true, "fields.Status": "Active"});
        for (const contract of contracts) {
            const latestTransaction = await DataRecord.findOne({ 
                objectName: "Transaction", 
                isActive: true, 
                'fields.ContractId': contract._id.toString(),
            }).sort({ 'createdAt': -1 });
            const dataModelDetail = await Datamodel.findOne({name: "Transaction", company: contract.company});
            const dataRecordCount = await DataRecord.find({ objectName: "Transaction", company: contract.company, 'fields.ContractId': contract._id.toString() }).lean().count();
            
            //@ts-ignore
            if(dataRecordCount === 0 || !latestTransaction?.fields.TotalOutstanding ) {
                console.log("No Amount to calculate interest on.")
                continue;
            }
            
            const recordId = dataModelDetail?.prefix + ' ' + (dataRecordCount + 1)

            // Interest calculation based on latest details
            //@ts-ignore
            //@ts-ignore
            const totalOutstanding = parseFloat(latestTransaction?.fields?.TotalOutstanding).toFixed(2);
            //@ts-ignore
            const endingBalance = parseFloat(latestTransaction?.fields?.EndingBalance).toFixed(2);
            //@ts-ignore
            const facilityAvailable = parseFloat(latestTransaction?.fields?.FacilityAvailable).toFixed(2);
            //@ts-ignore
            const startingBalance = parseFloat(latestTransaction?.fields?.StartingBalance).toFixed(2);
            //@ts-ignore
            const interest = (parseFloat(totalOutstanding || 0) * contract.fields.DailyRate / 100).toFixed(2);
            //@ts-ignore
            const interestBalance = (parseFloat(latestTransaction?.fields?.InterestBalance || 0) + parseFloat(interest)).toFixed(2);

            //@ts-ignore
            const balanceIncludingInterest = (parseFloat(interest) + parseFloat(latestTransaction?.fields?.BalanceIncludingInterest || 0)).toFixed(2);
            const interestTransaction = {
                Type: "Interest",
                Interest: interest,
                InterestBalance: interestBalance,
                BalanceIncludingInterest: balanceIncludingInterest,
                ContractId: contract._id.toString(),
                //@ts-ignore
                EndingBalance: endingBalance,
                //@ts-ignore
                FacilityAvailable: facilityAvailable,
                //@ts-ignore
                StartingBalance: startingBalance,
                //@ts-ignore
                TotalOutstanding:totalOutstanding
            };

            const newTransaction = new DataRecord({
                recordId: recordId,
                company: contract.company,
                objectName: "Transaction",
                primaryKey: "",
                dataModel: dataModelDetail?.id,
                //@ts-ignore
                fields: interestTransaction
            })

            await newTransaction.save();
        }
    } catch (error) {
        console.error('Error calculating interest:', error);
    }
}

export default calculateInterest;