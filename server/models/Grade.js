import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const GradeSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    scores: {
        type: Object,
        required: true
    },
    quarter: {
        type: Number,
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

const Grade = mongoose.model('Grade', GradeSchema);
export default Grade;