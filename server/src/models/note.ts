import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CompanyDoc } from "./company";
import { UserDoc } from "./user";


export enum referenceType {
    dataRecord = "datarecord",
    workflow = "workflow"
}

// An interface that describes the properties
// that are required to create a new Notes
interface NoteAttrs {
    comment: String,
    reference: referenceType;
    referenceId: Object;
    recordId: Object;
    company: CompanyDoc
    createdBy: UserDoc,
    isActive?: boolean
}


// An interface that describes the properties
// that a Notes Model has
interface NoteModel extends mongoose.PaginateModel<NoteDoc> {
    build(attrs: NoteAttrs): NoteDoc;
}

// An interface that describes the properties
// that a Notes Document has
interface NoteDoc extends mongoose.Document {
    comment: String,
    reference: referenceType;
    referenceId: Object;
    recordId: Object;
    company: CompanyDoc
    createdBy: UserDoc,
    isActive?: boolean
}

const noteSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: true,
        },
        reference: {
            type: String,
            required: true,
            enum: Object.values(referenceType),
            default: referenceType.dataRecord
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        recordId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isActive: {
            type: Boolean,
            default: true
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
        timestamps: true
    }
);

noteSchema.pre("save", async function (done) {
    done();
});

noteSchema.statics.build = (attrs: NoteAttrs) => {
    return new Note(attrs);
};

noteSchema.plugin(paginate);

const Note = mongoose.model<NoteDoc, NoteModel>("Note", noteSchema);

export { Note, NoteDoc };
