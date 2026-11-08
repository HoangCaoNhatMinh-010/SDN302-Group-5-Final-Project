import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    isForFamilyMember: {
      type: Boolean,
      default: false,
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    room: {
      type: String,
      default: 'Phòng 204',
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['WAITING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'CONFIRMED',
    },
    type: {
      type: String,
      default: 'Khám định kỳ',
    },
    symptoms: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.patientId = ret.patientId.toString();
        if (ret.familyMemberId) ret.familyMemberId = ret.familyMemberId.toString();
        if (ret.doctorId) ret.doctorId = ret.doctorId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto generate code before save if not present
appointmentSchema.pre('save', async function (next) {
  if (!this.code) {
    this.code = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);

