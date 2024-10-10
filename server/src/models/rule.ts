import mongoose from "mongoose";
import {RuleSetDoc} from "./rule-set";

export enum DataType {
  string = "String",
  number = "Number",
  array = "Array",
  object = "Object"
}

export enum Priority {
  high = 100,
  medium=50,
  low = 1,
}

interface Criteria {
  id:number,
  dataType:DataType;
  fact:string;
  operator:string;
  value:any;
  path:string;
  params:any;
  priority?:Priority;
}

interface Event {
  name:string;
  type:string;
  params:any;
}
// An interface that describes the properties
// that are required to create a new Rule
interface RuleAttrs {
  name: string;
  ruleSet: RuleSetDoc;
  condition:string
  priority?:Priority;
  criteria?:Criteria[];
  event?:Event;
  isActive: boolean;
}

// An interface that describes the properties
// that a Rule Model has
interface RuleModel extends mongoose.Model<RuleDoc> {
  build(attrs: RuleAttrs): RuleDoc;
}

// An interface that describes the properties
// that a RuleSet Document has
interface RuleDoc extends mongoose.Document {
  name: string;
  ruleSet: RuleSetDoc;
  condition:string
  priority?:Priority;
  criteria?:Criteria[];
  event?:Event;
  isActive: boolean
}

const ruleSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      ruleSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RuleSet",
      },
      condition: {
        type: String,
        required: true,
      },
      priority: {
        type: Number,
        default: Priority.low,
      },
      criteria: {
        type: [{
          type: Object,
        }],
      },
      event: {
        type: Object,
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

ruleSchema.pre("save", async function(done) {
  done();
});

ruleSchema.statics.build = (attrs: RuleAttrs) => {
  return new Rule(attrs);
};

const Rule = mongoose.model<RuleDoc, RuleModel>("Rule", ruleSchema);

export {Rule, RuleDoc};
