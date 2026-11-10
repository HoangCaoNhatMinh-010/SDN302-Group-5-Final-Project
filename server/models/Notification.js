import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', sparse: true },
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', sparse: true },
    type: {
      type: String,
      enum: ['CONFIRM', 'REMIND_24H', 'REMIND_2H', 'VACCINE_DUE', 'RECHECK', 'CANCEL', 'REFUND'],
      required: true,
    },
    channel: { type: String, enum: ['ZALO', 'SMS', 'PUSH', 'EMAIL'], required: true },
    recipient: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'], default: 'PENDING' },
    scheduled_at: { type: Date, required: true },
    sent_at: { type: Date },
    error_message: { type: String },
    retry_count: { type: Number, default: 0 },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'notifications' }
);

notificationSchema.index({ status: 1, scheduled_at: 1 });
notificationSchema.index({ owner_id: 1, created_at: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);