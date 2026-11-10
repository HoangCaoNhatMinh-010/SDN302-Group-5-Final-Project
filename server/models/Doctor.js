import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
    },
    title: {
      type: String,
      default: 'Bác sĩ chuyên khoa I',
    },
    department: {
      type: String,
      default: 'Khoa Khám bệnh',
    },
    room: {
      type: String,
      default: 'Phòng 204 - Tầng 2',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    bio: {
      type: String,
      default: 'Bác sĩ nhiều năm kinh nghiệm trong chẩn đoán và điều trị.',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    consultationFee: {
      type: Number,
      default: 200000,
    },
    availableDays: {
      type: [String],
      default: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    },
    timeSlots: {
      type: [String],
      default: [
        '08:30 - 09:30',
        '09:30 - 10:30',
        '10:30 - 11:30',
        '13:30 - 14:30',
        '14:30 - 15:30',
        '15:30 - 16:30',
        '16:30 - 17:30',
        '18:00 - 19:00',
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);

