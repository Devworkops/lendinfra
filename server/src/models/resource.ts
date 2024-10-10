import mongoose from "mongoose";
import { WorkflowDoc } from "./workflow";

export enum ResourceType {
    variable = "Variable",
    constant = "Constant",
    text = "Text",
    stage = "Stage"
}

export enum DataType {
  text = "Text",
  record = "Record",
  number = "Number",
  currency = "Currency",
  boolean = "Boolean",
  date = "Date",
  datetime = "DateTime",
  picklist = "Picklist",
  mspicklist = "Multi-Select Picklist",
}


// An interface that describes the properties
// that are required to create a new Resource
interface ResourceAttrs {
  workflowId: WorkflowDoc
  resourceType: ResourceType;
  apiName:string;
  description:string;
  dataType:DataType;
  body: string;
  order: number;
  active?: boolean;
  multipleAllowed?: boolean;
  avilableForInput?: boolean;
  availableForOutput?: boolean;
  defaultValue?:{};
  object:{};
  decimalPlaces?:number;
}

// An interface that describes the properties
// that a Resource Model has
interface ResourceModel extends mongoose.Model<ResourceDoc> {
  build(attrs: ResourceAttrs): ResourceDoc;
}

// An interface that describes the properties
// that a Resource Document has
interface ResourceDoc extends mongoose.Document {
  resourceType: ResourceType;
  apiName:string;
  description:string;
  dataType:DataType;
  body: string;
  order: number;
  active?: boolean;
  multipleAllowed?: boolean;
  avilableForInput?: boolean;
  availableForOutput?: boolean;
  defaultValue?:{};
  object:{};
  decimalPlaces?:number;
}

const ResourceSchema = new mongoose.Schema(
  {
    workflowId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: Object.values(ResourceType),
      required: true,
    },
    apiName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    dataType: {
      type: String,
      enum: Object.values(DataType),
      required: true,
      default: DataType.text
    },
    body: {
      type: String,
      required: true,
      default: "Edit the body for custom message"
    },
    order: {
      type: Number,
      required: true,
      default: 1
    },
    active: {
      type: Boolean,
      default: false
    },
    multipleAllowed: {
      type: Boolean,
      default: false
    },
    avilableForInput: {
      type: Boolean,
      default: false
    },
    avilableForOutput: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Object,
    },
    object: {
      type: Object,
      required: true,
      default: {}
    },
    decimalPlaces: {
      type: Number,
      default: 2
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
  }
);

ResourceSchema.pre("save", async function (done) {
  done();
});

ResourceSchema.statics.build = (attrs: ResourceAttrs) => {
  return new Resource(attrs);
};

const Resource = mongoose.model<ResourceDoc, ResourceModel>("Resource", ResourceSchema);

export { Resource, ResourceDoc };