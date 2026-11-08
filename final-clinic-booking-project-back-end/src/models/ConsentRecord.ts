import mongoose, { Document, Schema } from "mongoose";

export interface ConsentRecordDocument extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  version: string;
  acceptedAt: Date;
  revokedAt?: Date;
}

const consentRecordSchema = new Schema<ConsentRecordDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, maxlength: 80 },
    version: { type: String, required: true, maxlength: 40 },
    acceptedAt: { type: Date, default: Date.now },
    revokedAt: Date,
  },
  { timestamps: true }
);

consentRecordSchema.index({ user: 1, type: 1, version: 1 });

export const ConsentRecord = mongoose.model<ConsentRecordDocument>("ConsentRecord", consentRecordSchema);
