import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    type: { type: String, enum: ['DEPOSIT', 'FINAL', 'REFUND', 'EXTRA'], required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['CASH', 'VNPAY', 'MOMO', 'ZALOPAY', 'BANK_TRANSFER'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },
    transaction_ref: { type: String, sparse: true },
    gateway_response: { type: mongoose.Schema.Types.Mixed },
    paid_at: { type: Date },
    refunded_at: { type: Date },
    refund_reason: { type: String },
    idempotency_key: { type: String, sparse: true, unique: true },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'payments' }
);

paymentSchema.index({ appointment_id: 1, type: 1 });
paymentSchema.index({ status: 1, created_at: -1 });
paymentSchema.index({ paid_at: -1 });
paymentSchema.index({ transaction_ref: 1 }, { sparse: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);