import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Tên thú cưng (hoặc tên người thân)
    name: {
      type: String,
      required: [true, 'Tên thú cưng không được để trống'],
      trim: true,
    },
    // Loại thú cưng (Chó, Mèo, Hamster, Khác) hoặc mối quan hệ
    relationship: {
      type: String,
      required: [true, 'Vui lòng chọn loại thú cưng hoặc phân loại'],
      trim: true,
    },
    petType: {
      type: String,
      default: 'Chó',
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
      default: 'Chưa rõ',
    },
    weight: {
      type: Number,
      default: 3.5, // kg
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Vui lòng nhập ngày sinh hoặc tuổi của thú cưng'],
      trim: true,
    },
    gender: {
      type: String,
      default: 'Đực',
      trim: true,
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
      default: '', // Mã vòng cổ / Microchip / Thẻ thú cưng
    },
    note: {
      type: String,
      trim: true,
      default: '', // Thói quen, lưu ý khi tắm/cắt tỉa, tiêm phòng...
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

export const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
