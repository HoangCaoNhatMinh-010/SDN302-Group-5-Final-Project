import mongoose, { Document, Schema } from "mongoose";

export interface OtpChallengeDocument extends Document {
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
}

const otpChallengeSchema = new Schema<OtpChallengeDocument>(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
    consumedAt: Date,
  },
  { timestamps: true }
);

export const OtpChallenge = mongoose.model<OtpChallengeDocument>("OtpChallenge", otpChallengeSchema);
