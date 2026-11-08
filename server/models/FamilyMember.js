import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Họ và tên người thân không được để trống'],
      trim: true,
    },
    relationship: {
      type: String,
      required: [true, 'Vui lòng chọn mối quan hệ'],
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Vui lòng nhập ngày sinh'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
      required: [true, 'Vui lòng chọn giới tính'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    idCard: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.patientId = ret.patientId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

