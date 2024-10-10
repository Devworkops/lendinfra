import mongoose from "mongoose";
import {DataType} from "./rule";
import {RuleSetDoc} from "./rule-set";

export enum RuleActionType {
  update = "Update Record",
  delete = "Delete Record",
  create = "Create New Record",
  message = "Show Notification",
  api = "Invoke Api"
}


interface InputParameter {
  id:number,
  dataType:DataType;
  name:string;
  fieldName?:string
  value:any;
}

// An interface that describes the properties
// that are required to create a new Rule
interface RuleActionAttrs {
  name: string;
  company: string;
  ruleSet: RuleSetDoc;
  type:RuleActionType;
  inputParameter:InputParameter[];
  isActive: boolean;
}

// An interface that describes the properties
// that a Rule Model has
interface RuleActionModel extends mongoose.Model<RuleActionDoc> {
  build(attrs: RuleActionAttrs): RuleActionDoc;
}

// An interface that describes the properties
// that a RuleSet Document has
interface RuleActionDoc extends mongoose.Document {
  name: string;
  ruleSet: RuleSetDoc;
  type:RuleActionType;
  inputParameter:InputParameter[];
  isActive: boolean
}

const ruleActionSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      ruleSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RuleSet",
      },
      type: {
        type: String,
        enum: Object.values(RuleActionType),
      },
      inputParameter: {
        type: [{
          type: Object,
        }],
      },
      isActive: {
        type: Boolean,
        default: true,
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
    }
);

ruleActionSchema.pre("save", async function(done) {
  done();
});

ruleActionSchema.statics.build = (attrs: RuleActionAttrs) => {
  return new RuleAction(attrs);
};

const RuleAction = mongoose.model<RuleActionDoc, RuleActionModel>("RuleAction", ruleActionSchema);

export {RuleAction, RuleActionDoc};
