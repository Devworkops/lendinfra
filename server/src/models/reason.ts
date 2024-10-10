import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";
import { UserDoc } from "./user";

interface ReasonAttrs {
    primaryKey: string;
    objectName: string;
    company: CompanyDoc;
    createdBy: UserDoc;
    fields: Object;
    createdAt?: Date;
}


interface ReasonModel extends mongoose.PaginateModel<ReasonDoc> {
    build(attrs: ReasonAttrs): ReasonDoc;
}

interface ReasonDoc extends mongoose.Document {
    primaryKey: string;
    objectName: string;
    company: CompanyDoc;
    createdBy: UserDoc;
    fields: Object;
    createdAt?: Date;
}

const reasonSchema = new mongoose.Schema(
    {
        primaryKey: {
            type: String,
            required: true,
        },
        objectName: {
            type: String,
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fields: {
            type: Object,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
        timestamps: true,
    }
);

reasonSchema.pre("save", async function (done) {
    done();
});

reasonSchema.statics.build = (attrs: ReasonAttrs) => {
    return new Reason(attrs);
};

reasonSchema.plugin(paginate);

const Reason = mongoose.model<ReasonDoc, ReasonModel>("Reason", reasonSchema);

export { Reason, ReasonDoc };
