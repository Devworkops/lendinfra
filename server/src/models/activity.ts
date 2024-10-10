import mongoose, { Document, Schema } from 'mongoose';
import paginate from "mongoose-paginate-v2";

interface ActivityAttrs {
    record_id:string;
    company: string;
    user?: string;
    object_type:string;
    activity: string;
    oldDataRecord:object;
    newDataRecord:object;
    timestamp: Date;
}

// interface ActivityModel extends mongoose.Model<ActivityDoc> {
//     build(attrs: ActivityAttrs): ActivityDoc;
// }

interface ActivityModel extends mongoose.PaginateModel<ActivityDoc> {
    build(attrs: ActivityAttrs): ActivityDoc;
}

interface ActivityDoc extends mongoose.Document {
    record_id:string;
    company: string;
    user?: string;
    object_type:string;
    activity: string;
    oldDataRecord:object;
    newDataRecord:object;
    timestamp: Date;
}

const activitySchema = new mongoose.Schema(
    {
        record_id: {
            type: String,
        },
        company: {
            type: String,
        },
        user: {
            type: String,
            ref: 'User' 
        },
        object_type: {
            type: String,
        },        
        activity: {
            type: String,
            required: true,
        },
        oldDataRecord: {
            type: Object,
        },
        newDataRecord: {
            type: Object,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
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

activitySchema.pre("save", async function (done) {
    done();
});

activitySchema.statics.build = (attrs: ActivityAttrs) => {
    return new Activity(attrs);
};
activitySchema.plugin(paginate);

const Activity = mongoose.model<ActivityDoc, ActivityModel>("Activity", activitySchema);

export { Activity, ActivityDoc };
