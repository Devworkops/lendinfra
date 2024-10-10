import mongoose, { mongo } from "mongoose";

export enum IntegrationType {
  api = "API",
  database = "DATABASE",
  sso = "SSO"
}

export enum Integrations {
  trustloop = "TrustLoop",
  transUnion = "TransUnion",
  zoho= "Zoho",
  twilio= "Twilio",
  lendXP="LendXp"
}

export type MetafieldsAttrs = {
  key: string;
  label: string;
  value: any;
  type: string;
  isEditable: boolean;
  isVisible?: boolean
}

export type ActionAttrs = {
  name:string;
  apiName:String;
  params?:[{id:string, label:string}]
}
// An interface that describes the properties
// that are requried to create a new Integration
interface IntegrationAttrs {
  name: string;
  description?: string;
  logo?: string;
  company?: string;
  type: IntegrationType;
  actions?:[ActionAttrs]
  metaFields?: [MetafieldsAttrs],
  isVisible?: boolean,
  Signature?:string
}

// An interface that describes the properties
// that a Integration Model has
interface IntegrationModel extends mongoose.Model<IntegrationDoc> {
  build(attrs: IntegrationAttrs): IntegrationDoc;
}

// An interface that describes the properties
// that a Integration Document has
interface IntegrationDoc extends mongoose.Document {
  name: string;
  description?: string;
  logo?: string;
  company?: string;
  type: IntegrationType;
  metaFields?: [MetafieldsAttrs];
  actions?:[ActionAttrs]
  isActive?: boolean;
  isVisible?: boolean
}

const integrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    company: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(IntegrationType),
    },
    actions:{
      type: [Object],
    },
    metaFields: {
      type: [Object],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVisible: {
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
    timestamps: true,
  }
);

integrationSchema.pre("save", async function (done) {
  done();
});

integrationSchema.statics.build = (attrs: IntegrationAttrs) => {
  return new Integration(attrs);
};

const Integration = mongoose.model<IntegrationDoc, IntegrationModel>("Integration", integrationSchema);

export async function getIntegrationConfig(companyId: string, integrationName: string): Promise<IntegrationDoc> {
  let company = new mongo.ObjectId(companyId);
  // Get trustloop config
  let config = await Integration.findOne({ company: company, name: integrationName });
  if (config) {
    return config
  }
  else {
    throw Error(`Please configure ${integrationName} Integration!`)
  }

}

export { Integration, IntegrationDoc };
