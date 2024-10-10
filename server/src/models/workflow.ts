import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";

// Workflow->Workflow-step->workflow-element

interface Node {
    id:string; 
    width:number;
    height:number;
    type:string;
    data:{label:string, workflowId:string, stepData?:Object};
    position:Object;
    className:string;
    style:Object;
    positionAbsolute:Object;
    selected:boolean;
    dragging:false;
}

interface Edge {
    id:string;
    source:string;
    target:string;
    type:string;
    markerEnd:Object;
    data:Object;
    selected:boolean;
    sourceHandle?:string;
}

export enum FlowType {
    recordTriggered = "Record-Triggered Flow",
    platformEventTriggeredFlow = "Platform Event—Triggered Flow",
    scheduleTriggeredFlow = "Schedule-Triggered Flow",
    autolaunchedFlow = "Autolaunched Flow"
}

export enum FilterType {
    or = 'OR',
    and='AND',
    none = 'NONE',
    custom='CUSTOM'
}

export enum TriggerType {
    update = "Update",
    delete = "Delete",
    create = "Create",
    createOrUpdate = "CreateOrUpdate"
}

export enum WorkflowConfigStatus {
    draft = "DRAFT",
    published = "PUBLISHED"
}

export enum NodeType {
    start = 'startNode',
    end = 'endNode',
    assignment = 'assignmentNode',
    decision = 'decisionNode',
    loop = 'loopNode',
    action = 'actionNode',
    createRecord ='createRecordNode',
    getRecord ='getRecordNode',
    updateRecord ='updateRecordNode',
    deleteRecord ='deleteRecordNode',
    wait = 'waitNode',
    note = 'noteNode',
    lendXP = 'lendxpNode'
}

interface FilterCondition {
    id:number,
    variable:string;
    operator:string;
    value:any;
    path?:string;
}



// An interface that describes the properties
// that are required to create a new Workflow
interface WorkflowAttrs {
    name: string;
    description: string;
    company: CompanyDoc;
    createdBy: string;
    type: FlowType;
    triggerType?:TriggerType;
    object?:string; // object whose records trigger the flow when they’re created, updated, or deleted.
    filterConditions?:FilterCondition[]; // To reduce the number of records that trigger the flow and the number of times the flow is executed.
    status?:WorkflowConfigStatus;
    filterType: FilterType
}


// An interface that describes the properties
// that a Workflow Model has
interface WorkflowModel extends mongoose.PaginateModel<WorkflowDoc> {
    build(attrs: WorkflowAttrs): WorkflowDoc;
}

// An interface that describes the properties
// that a Workflow Document has
interface WorkflowDoc extends mongoose.Document {
    name: string;
    description: string;
    company: CompanyDoc
    createdBy: string
    type: FlowType;
    triggerType?:TriggerType;
    object?:string
    filterType?:FilterType;
    filterConditions?:FilterCondition[];
    status:WorkflowConfigStatus;
    isActive:boolean;
    config?:{nodes:Node[], edges:Edge[], viewport:Object};
}

const workflowSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        createdBy: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(FlowType),
        },
        triggerType: {
            type: String,
            enum: Object.values(TriggerType),
        },
        object: {
            type: String,
        },
        filterType: {
            type: String,
            required: true,
            enum: Object.values(FilterType),
            default:FilterType.none
        },
        filterConditions: {
            type: [{
              type: Object,
            }],
        },
        isActive: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(WorkflowConfigStatus),
            default:WorkflowConfigStatus.draft
        },
        config: {
            type: Object,
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

workflowSchema.pre("save", async function (done) {
    done();
});

workflowSchema.statics.build = (attrs: WorkflowAttrs) => {
    return new Workflow(attrs);
};

workflowSchema.plugin(paginate);

const Workflow = mongoose.model<WorkflowDoc, WorkflowModel>("Workflow", workflowSchema);

export { Workflow, WorkflowDoc, Node, Edge };
