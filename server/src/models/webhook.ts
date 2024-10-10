import mongoose, { Document, Schema } from 'mongoose';

interface WebhookAttrs {
    company: string;
    user: string;
    url:string;
    timestamp: Date;
}

interface WebhookModel extends mongoose.Model<WebhookDoc> {
    build(attrs: WebhookAttrs): WebhookDoc;
}

interface WebhookDoc extends mongoose.Document {
    company: string;
    user: string;
    url:string;
    timestamp: Date;
}

const webhookSchema = new mongoose.Schema(
    {
        company: {
            type: String,
        },
        user: {
            type: String,
        },
        url: {
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

webhookSchema.pre("save", async function (done) {
    done();
});

webhookSchema.statics.build = (attrs: WebhookAttrs) => {
    return new Webhook(attrs);
};

const Webhook = mongoose.model<WebhookDoc, WebhookModel>("WebhookSetting", webhookSchema);

export { Webhook, WebhookDoc };
