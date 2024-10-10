import { string } from 'mathjs';
import mongoose, { Document, Schema } from 'mongoose';

interface WebhookEventAttrs {
    company: string;
    consent_id:string;
    new_status:string;
    notification_utc_time:string
    timestamp: Date;
}

interface WebhookEventModel extends mongoose.Model<WebhookEventDoc> {
    build(attrs: WebhookEventAttrs): WebhookEventDoc;
}

interface WebhookEventDoc extends mongoose.Document {
    company: string;
    consent_id:string;
    new_status:string;
    notification_utc_time:string
    timestamp: Date;
}

const webhookEventSchema = new mongoose.Schema(
    {
        company: {
            type: String,
        },
        consent_id: {
            type: String,
        },
        new_status: {
            type: String,
        },
        notification_utc_time: {
            type: String,
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

webhookEventSchema.pre("save", async function (done) {
    done();
});

webhookEventSchema.statics.build = (attrs: WebhookEventAttrs) => {
    return new WebhookEvent(attrs);
};

const WebhookEvent = mongoose.model<WebhookEventDoc, WebhookEventModel>("WebhookEvents", webhookEventSchema);

export { WebhookEvent, WebhookEventDoc };
