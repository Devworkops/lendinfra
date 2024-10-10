import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new Application
interface ApplicationAttrs {
  account: string;
  loanAmount:string;
  product:string;
  createdDate:string
  createdBy?: string;
  lastModifiedDate:string;
  lastUpdatedBy:string;
}

// An interface that describes the properties
// that an Application Model has
interface ApplicationModel extends mongoose.Model<ApplicationDoc> {
  build(attrs: ApplicationAttrs): ApplicationDoc;
}

// An interface that describes the properties
// that an Application Document has
interface ApplicationDoc extends mongoose.Document {
  ApplicationName: string;
  industry:string;
  country:string;
  timeZone:string
  address?: string;
  isActive?:boolean;
}

const applicationSchema = new mongoose.Schema(
  {
    ApplicationName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    timeZone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    isActive:{
        type:Boolean,
        default:true
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
    timestamps: true,
  }
);

applicationSchema.pre("save", async function (done) {
  done();
});

applicationSchema.statics.build = (attrs: ApplicationAttrs) => {
  return new Application(attrs);
};

const Application = mongoose.model<ApplicationDoc, ApplicationModel>("Application", applicationSchema);

export { Application, ApplicationDoc };
