import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    job: {
        type: String,
        required: [true, 'Job is required'],
        trim: true
    },
    jobLocation: {
        type: String,
        required: [true, 'Job location is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    circle: {
        type: String,
        required: [true, 'Circle is required'],
        trim: true
    },
    paymentId: {
        type: String,
        required: [true, 'Payment ID is required'],
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster searches
registrationSchema.index({ name: 'text', phone: 'text', circle: 'text' });
registrationSchema.index({ submittedAt: -1 });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
