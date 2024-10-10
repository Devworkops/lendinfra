import mongoose, { Date } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";
import { WorkflowDoc } from "./workflow";


enum WorkflowStatus {
    inProgress = "In Progress",
    completed = "Completed",
    paused = "Paused",
    error = "Error",
}

// An interface that describes the properties
// that are required to create a new WorkflowInstance
interface WorkflowInstanceAttrs {
    recordId: string;
    workflow: WorkflowDoc
    company: CompanyDoc
    status: WorkflowStatus
    result?: string
    startedAt: Date
    complatedAt?: Date
}

// An interface that describes the properties
// that a WorkflowInstance Model has
interface WorkflowInstanceModel extends mongoose.PaginateModel<WorkflowInstanceDoc> {
    build(attrs: WorkflowInstanceAttrs): WorkflowInstanceDoc;
}

// An interface that describes the properties
// that a WorkflowInstance Document has
interface WorkflowInstanceDoc extends mongoose.Document {
    recordId: string;
    workflow: WorkflowDoc
    company: CompanyDoc
    status: WorkflowStatus
    result?: string
    startedAt: Date
    complatedAt?: Date
}

const WorkflowInstanceSchema = new mongoose.Schema(
    {
        recordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DataRecord'
        },
        workflow: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workflow'
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(WorkflowStatus),
            default: WorkflowStatus.inProgress
        },
        result: {
            type: String,
        },
        startedAt: {
            type: mongoose.Schema.Types.Date,
        },
        complatedAt: {
            type: mongoose.Schema.Types.Date,
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

WorkflowInstanceSchema.pre("save", async function (done) {
    done();
});

WorkflowInstanceSchema.statics.build = (attrs: WorkflowInstanceAttrs) => {
    return new WorkflowInstance(attrs);
};

WorkflowInstanceSchema.plugin(paginate);

const WorkflowInstance = mongoose.model<WorkflowInstanceDoc, WorkflowInstanceModel>("WorkflowInstance", WorkflowInstanceSchema);

export { WorkflowInstance, WorkflowInstanceDoc, WorkflowStatus };
