import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";
import { DatamodelDoc } from "./data-model";
import { UserDoc } from "./user";
import { ObjectId } from "mongodb";

// An interface that describes the properties
// that are required to create a new DataRecord
interface DataRecordAttrs {
    _id?: ObjectId;
    objectName: string;
    uniqueId: string; // will create using primary and secondary keys
    primaryKey: string;
    secondaryKey?: string;
    recordId: string;
    dataModel: DatamodelDoc
    company: CompanyDoc;
    createdBy: UserDoc;
    fields: Object;
    isActive?: boolean;
    createdAt?: Date;
}


// An interface that describes the properties
// that a DataRecord store has
interface DataRecordModel extends mongoose.PaginateModel<DataRecordDoc> {
    build(attrs: DataRecordAttrs): DataRecordDoc;
}

// An interface that describes the properties
// that a DataRecord Document has
interface DataRecordDoc extends mongoose.Document {
    objectName: string;
    uniqueId: string;
    primaryKey: string;
    secondaryKey?: string;
    recordId: string;
    dataModel: DatamodelDoc;
    company: CompanyDoc;
    createdBy: UserDoc;
    fields: Object;
    isActive?: boolean;
    createdAt?: Date;
}

const dataRecordSchema = new mongoose.Schema(
    {
        objectName: {
            type: String,
            required: true,
        },
        uniqueId: {
            type: String,
        },
        primaryKey: {
            type: String,
        },
        secondaryKey: {
            type: String,
        },
        recordId: {
            type: String,
            required: true,
        },
        dataModel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Datamodel'
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fields: {
            type: Object
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            required: false
        }
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
        timestamps: true
    }
);

dataRecordSchema.pre("save", async function (done) {
    done();
});

dataRecordSchema.statics.build = (attrs: DataRecordAttrs) => {
    return new DataRecord(attrs);
};

dataRecordSchema.plugin(paginate);

const DataRecord = mongoose.model<DataRecordDoc, DataRecordModel>("DataRecord", dataRecordSchema);

export { DataRecord, DataRecordDoc };
