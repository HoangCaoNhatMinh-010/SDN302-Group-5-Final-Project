import mongoose, { Document, Schema } from "mongoose";

export interface PaymentDocument extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  provider: string;
  providerReference?: string;
  paidAt?: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND", uppercase: true },
    status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    provider: { type: String, default: "MANUAL" },
    providerReference: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export const Payment = mongoose.model<PaymentDocument>("Payment", paymentSchema);
