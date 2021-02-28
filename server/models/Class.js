import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ClassSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sectionId: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: String,
        required: true
    }
});

const Section = mongoose.model('Class', ClassSchema);
export default Section;