import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

    pet_snapshot: {
      name: String,
      species: String,
      breed: String,
      allergies: [String],
      special_notes: String,
    },
    owner_snapshot: { full_name: String, phone: String },
    service_snapshot: {
      name: String,
      price: Number,
      duration_minutes: Number,
      requires_vet_license: Boolean,
    },

    appointment_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    slot_key: { type: String, required: true },

    status: {
      type: String,
      enum: [
        'REQUESTED', 'AWAITING_DEPOSIT', 'CONFIRMED',
        'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED',
        'CANCELLED_EARLY', 'CANCELLED_LATE', 'NO_SHOW',
        'REJECTED', 'EXPIRED',
      ],
      default: 'REQUESTED',
    },

    deposit_required: { type: Number, default: 0 },
    deposit_paid: { type: Number, default: 0 },
    deposit_status: {
      type: String,
      enum: ['NONE', 'PENDING', 'PAID', 'REFUNDED', 'FORFEITED'],
      default: 'NONE',
    },

    customer_notes: { type: String },
    staff_notes: { type: String },
    cancel_reason: { type: String },

    requested_at: { type: Date, default: Date.now },
    confirmed_at: { type: Date },
    checked_in_at: { type: Date },
    started_at: { type: Date },
    completed_at: { type: Date },
    cancelled_at: { type: Date },

    created_by: {
      type: String,
      enum: ['CUSTOMER', 'RECEPTIONIST', 'SYSTEM'],
      default: 'CUSTOMER',
    },
    confirmed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'appointments' }
);

appointmentSchema.index({ slot_key: 1 }, { unique: true });
appointmentSchema.index({ appointment_date: 1, staff_id: 1, status: 1 });
appointmentSchema.index({ owner_id: 1, appointment_date: -1 });
appointmentSchema.index({ pet_id: 1, appointment_date: -1 });
appointmentSchema.index({ status: 1, appointment_date: 1 });
appointmentSchema.index({ staff_id: 1, appointment_date: 1, start_time: 1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);