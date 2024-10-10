import mongoose from "mongoose";


// An interface that describes the properties
// that are required to create a new RuleSet
interface RuleSetAttrs {
  name: string;
  company: string;
  condition?: string;
  isActive: boolean
  objectName:string;
}

// An interface that describes the properties
// that a RuleSet Model has
interface RuleSetModel extends mongoose.Model<RuleSetDoc> {
  build(attrs: RuleSetAttrs): RuleSetDoc;
}

// An interface that describes the properties
// that a RuleSet Document has
interface RuleSetDoc extends mongoose.Document {
  name: string;
  company: string;
  condition?:string;
  isActive: boolean;
  objectName:string;
}

const ruleSetSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      objectName: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      condition: {
        type: String,
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

ruleSetSchema.pre("save", async function(done) {
  done();
});

ruleSetSchema.statics.build = (attrs: RuleSetAttrs) => {
  return new RuleSet(attrs);
};

const RuleSet = mongoose.model<RuleSetDoc, RuleSetModel>("RuleSet", ruleSetSchema);

export {RuleSet, RuleSetDoc};
