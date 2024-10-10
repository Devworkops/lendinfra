import mongoose from "mongoose";
import { CompanyDoc } from "./company";
import { Password } from "../helper/password";

export enum Provider {
  facebook = "Facebook",
  google = "Google",
}

export enum RoleOptions {
  admin = "ADMIN", // They can invite other users to the system and also can be safe owners, with all access
  operator = "OPERATOR", // These users will have access to the system but cannot be safe owners
}

// An interface that describes the properties
// that are requried to create a new User
interface UserAttrs {
  firstName?: string;
  lastName?:string;
  email: string;
  password:string;
  company?: CompanyDoc;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  userName: string;
  email: string;
  password:string;
  token_version: number;
  reset_password_token?: string;
  reset_password_token_expiry?: number;
  facebook_id?: string;
  google_id?: string;
  mobileNo?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  city?: string;
  referalCode?: string;
  roles: [RoleOptions];
  notificationSetting: NotificationSettings |undefined;
  isActive?: Boolean;
  company?: CompanyDoc;
  createdBy: UserDoc;
  createdDate: Date;
}
interface NotificationSettings {
  [key:string]:string
}

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    token_version: {
      type: Number,
      required: true,
      default: 0,
    },
    reset_password_token: {
      type: String,
    },
    reset_password_token_expiry: {
      type: Number,
    },
    facebook_id: {
      type: String,
    },
    google_id: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    firstName: {
      type: String,
      required:true
    },
    lastName: {
      type: String,
      required:true
    },
    dateOfBirth: {
      type: String,
    },
    city: {
      type: String,
    },
    roles: {
      type: [String],
      required: true,
      enum: Object.values(RoleOptions),
      default: [RoleOptions.admin],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }, createdDate: {
      type: mongoose.Schema.Types.Date,
      default: Date.now(),
    },
    notificationSetting: {
      type: Object,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User, UserDoc };
