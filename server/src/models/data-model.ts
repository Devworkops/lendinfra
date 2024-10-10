import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";
import { UserDoc } from "./user";


export enum DataType {
    object = "object",
    array = "array",
    string = "string",
    integer = "number",
    decimal = "decimal",
    date = "date",
    boolean = "boolean",
    reference = "reference"
}

export enum DataFormat {
    datetime = "date-time",
    date = "date",
    time = "time",
    utcmillisec = "utc-millisec",
    color = "color",
    style = "style",
    phone = "phone",
    uri = "uri",
    email = "email",
    ipaddress = "ip-address",
    ipv6 = "ipv6"
}


// An interface that describes the properties
// that are required to create a new Datamodel
interface DatamodelAttrs {
    name: string;
    label: string;
    description: string;
    prefix: string;
    primaryKeys: string;
    secondaryKeys?: string;
    company: CompanyDoc;
    createdBy: UserDoc;
    type: DataType;
    properties: Object,
    required?: [string],
    isActive?: boolean
}


// An interface that describes the properties
// that a Datamodel Model has
interface DatamodelModel extends mongoose.PaginateModel<DatamodelDoc> {
    build(attrs: DatamodelAttrs): DatamodelDoc;
}

// An interface that describes the properties
// that a Datamodel Document has
interface DatamodelDoc extends mongoose.Document {
    name: string;
    label: string;
    description: string;
    prefix: string;
    primaryKeys: string;
    secondaryKeys?: string;
    company: CompanyDoc
    createdBy: UserDoc
    type: DataType;
    properties: Object,
    required?: [string],
    isActive?: boolean
}

const datamodelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        prefix: {
            type: String,
            required: true,
        },
        primaryKeys: {
            type: String,
        },
        secondaryKeys: {
            type: String,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(DataType),
            default: DataType.object
        },
        properties: {
            type: Object
        },
        required: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true
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
        timestamps: true
    }
);

datamodelSchema.pre("save", async function (done) {
    done();
});

datamodelSchema.statics.build = (attrs: DatamodelAttrs) => {
    return new Datamodel(attrs);
};

datamodelSchema.plugin(paginate);

const Datamodel = mongoose.model<DatamodelDoc, DatamodelModel>("Datamodel", datamodelSchema);

export { Datamodel, DatamodelDoc };
