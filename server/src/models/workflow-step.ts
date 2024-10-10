import mongoose from "mongoose";
import { WorkflowInstanceDoc, WorkflowStatus } from "./workflow-instance";

export enum StepType {
    interaction = "Interaction",
    logic = "Logic",
    data = "Data",
    start = "Start",
    end = "End"
}

export type MetafieldsAttrs = {
    name: string;
    operator: string;
    value: any;
}

// An interface that describes the properties
// that are required to create a new WorkflowStep
interface WorkflowStepAttrs {
    label: string;
    data?: object;
    name: string;
    description: string;
    workflowInstanceId: WorkflowInstanceDoc
    type:string;
    status:WorkflowStatus
    inputValues?:[MetafieldsAttrs],
    args?: string;
    dependsOn?: string;
    functionDetail?:string;
    condition?: string;
    result?:string;
    isActive?:boolean;
}

// An interface that describes the properties
// that a WorkflowStep Model has
interface WorkflowStepModel extends mongoose.Model<WorkflowStepDoc> {
    build(attrs: WorkflowStepAttrs): WorkflowStepDoc;
}

// An interface that describes the properties
// that a WorkflowStep Document has
interface WorkflowStepDoc extends mongoose.Document {
    label: string;
    data?: object|any;
    name: string;
    description: string;
    workflowInstanceId: WorkflowInstanceDoc;
    type:string;
    status:WorkflowStatus
    inputValues?:[MetafieldsAttrs],
    args?: string;
    dependsOn?: string;
    functionDetail?:string;
    condition?: string;
    result?:string;
    isActive:boolean;
}

const workflowStepSchema = new mongoose.Schema(
    {
        label:{
            type: String,
            required: true
        },
        data:{
            type: Object
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        workflowInstanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WorkflowInstance'
        },
        type: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(WorkflowStatus),
            default:WorkflowStatus.inProgress
        },
        inputValues: {
            type: [Object],
        },
        args: {
            type: String,
        },
        dependsOn: {
            type: String
        },
        functionDetail: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        condition: {
            type: String
        },
        result: {
            type: String
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
        timestamps:true
    }
);

workflowStepSchema.pre("save", async function (done) {
    done();
});

workflowStepSchema.statics.build = (attrs: WorkflowStepAttrs) => {
    return new WorkflowStep(attrs);
};

const WorkflowStep = mongoose.model<WorkflowStepDoc, WorkflowStepModel>("WorkflowStep", workflowStepSchema);

export { WorkflowStep, WorkflowStepDoc };
