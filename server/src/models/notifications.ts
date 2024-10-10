import mongoose, { Document, Schema } from 'mongoose';

interface NotificationAttrs {
    company: string;
    user: string;
    instatnce_id?:string;
    action: string;
    activity: string;
    is_read:number;
    timestamp: Date;
}

interface NotificationModel extends mongoose.Model<NotificationDoc> {
    build(attrs: NotificationAttrs): NotificationDoc;
}

interface NotificationDoc extends mongoose.Document {
    company: string;
    user: string;
    instatnce_id?:string;
    action: string;
    activity: string;
    is_read:number;
    timestamp: Date;
}

const notificationSchema = new mongoose.Schema(
    {
        company: {
            type: String,
        },
        user: {
            type: String,
        },
        instatnce_id: {
            type: String,
        },
        action: {
            type: String,
            required: true,
        },
        
        activity: {
            type: String,
            required: true,
        },
        is_read: {
            type: Number,
            default: 0
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

notificationSchema.pre("save", async function (done) {
    done();
});

notificationSchema.statics.build = (attrs: NotificationAttrs) => {
    return new Notification(attrs);
};

const Notification = mongoose.model<NotificationDoc, NotificationModel>("Notification", notificationSchema);

export { Notification, NotificationDoc };
