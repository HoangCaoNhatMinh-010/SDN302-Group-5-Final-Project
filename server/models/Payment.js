import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['DEPOSIT', 'FINAL'], required: true },
    method: { type: String, enum: ['MOMO', 'ZALOPAY', 'VNPAY', 'CASH'], required: true },
    status: { type: String, enum: ['PAID', 'REFUNDED'], required: true },
    transaction_ref: { type: String, default: '' },
    idempotency_key: { type: String, default: '' },
    paid_at: { type: Date },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'payments' }
);

export const Payment = mongoose.model('Payment', paymentSchema);
