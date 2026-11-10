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
    petName: {
      type: String,
      trim: true,
      default: '',
    },
    petBreed: {
      type: String,
      trim: true,
      default: '',
    },
    isForFamilyMember: {
      type: Boolean,
      default: true,
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
      default: 'Khu Spa & Grooming - Bàn 1',
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
      default: 'Gói Chăm sóc Thú cưng',
    },
    price: {
      type: Number,
      default: 180000,
    },
    bookingFee: {
      type: Number,
      default: 100,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED'],
      default: 'UNPAID',
    },
    paymentMethod: {
      type: String,
      enum: ['PAYOS', 'CASH'],
      default: 'PAYOS',
    },
    payosOrderCode: {
      type: Number,
      index: true,
      default: null,
    },
    payosCheckoutUrl: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
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
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.patientId) {
          ret.patientId = ret.patientId._id ? ret.patientId._id.toString() : ret.patientId.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto generate code before save if not present
appointmentSchema.pre('save', async function (next) {
  if (!this.code) {
    this.code = `PET-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);
