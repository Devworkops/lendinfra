import mongoose from "mongoose";
import {RoleOptions, UserDoc} from "./user";
import { CompanyDoc } from "./company";

// An interface that describes the properties
// that are requried to create a new Wallet Owner
interface UserToCompanyAttrs {
  user: UserDoc;
  company: CompanyDoc;
}

// An interface that describes the properties
// that a Wallet owner model has
interface UserToCompanyModel extends mongoose.Model<UserToCompanyDoc> {
  build(attrs: UserToCompanyAttrs): UserToCompanyDoc;
}

// An interface that describes the properties
// that a Wallet Owner Document has
interface UserToCompanyDoc extends mongoose.Document {
    user: UserDoc;
    company: CompanyDoc;
    status?: Boolean;
    roles?: [RoleOptions];
}

const userToCompanySchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'      
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    status:{
        type:Boolean,
        default: true
    },
    roles: {
        type: [String],
        required: true,
        enum: Object.values(RoleOptions),
        default: [RoleOptions.admin],
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

userToCompanySchema.pre("save", async function (done) {
  done();
});

userToCompanySchema.statics.build = (attrs: UserToCompanyAttrs) => {
  return new UserToCompany(attrs);
};

const UserToCompany = mongoose.model<UserToCompanyAttrs, UserToCompanyModel>("UserToCompany", userToCompanySchema);

export { UserToCompany,UserToCompanyDoc };
