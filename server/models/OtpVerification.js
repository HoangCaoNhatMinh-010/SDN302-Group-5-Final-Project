import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    otpCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB tự động xóa document khi quá hạn
    },
  },
  {
    timestamps: true,
  }
);

export const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);

