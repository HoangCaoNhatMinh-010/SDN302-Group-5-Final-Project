import mongoose from 'mongoose';

const otpSessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otp_hash: { type: String, required: true },
    purpose: { type: String, enum: ['LOGIN', 'VERIFY_PHONE'], default: 'LOGIN' },
    attempts: { type: Number, default: 0 },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { collection: 'otp_sessions' }
);

otpSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
otpSessionSchema.index({ phone: 1, created_at: -1 });

export default mongoose.models.OtpSession || mongoose.model('OtpSession', otpSessionSchema);