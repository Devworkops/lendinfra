import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new Company
interface CompanyAttrs {
  companyName: string;
  industry:string;
  country:string;
  timeZone:string
  address?: string;
}

// An interface that describes the properties
// that a Company Model has
interface CompanyModel extends mongoose.Model<CompanyDoc> {
  build(attrs: CompanyAttrs): CompanyDoc;
}

// An interface that describes the properties
// that a Company Document has
interface CompanyDoc extends mongoose.Document {
  companyName: string;
  industry:string;
  country:string;
  timeZone:string
  address?: string;
  isActive?:boolean;
}

const companySchema = new mongoose.Schema(
  {
    companyName: {
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

companySchema.pre("save", async function (done) {
  done();
});

companySchema.statics.build = (attrs: CompanyAttrs) => {
  return new Company(attrs);
};

const Company = mongoose.model<CompanyDoc, CompanyModel>("Company", companySchema);

export { Company, CompanyDoc };
