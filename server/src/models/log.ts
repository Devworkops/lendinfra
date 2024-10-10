import mongoose, { Document, Schema } from 'mongoose';

interface LogAttrs {
    company: string;
    user: string;
    action: string;
    activity: string;
    timestamp: Date;
}

interface LogModel extends mongoose.Model<LogDocument> {
    build(attrs: LogAttrs): LogDocument;
}

interface LogDocument extends Document {
    company: string;
    user: string;
    action: string;
    activity: string;
    timestamp: Date;
}

const logSchema = new mongoose.Schema(
    {
        company: {
            type: String,
        },
        user: {
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

logSchema.pre("save", async function (done) {
    done();
});

logSchema.statics.build = (attrs: LogAttrs) => {
    return new Log(attrs);
};

const Log = mongoose.model<LogDocument, LogModel>("Log", logSchema);

export { Log, LogDocument };
