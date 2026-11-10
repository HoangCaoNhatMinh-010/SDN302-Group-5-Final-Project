import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    status: {
      type: String,
      enum: [
        'REQUESTED', 'AWAITING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED_EARLY',
        'CANCELLED_LATE', 'REJECTED', 'NO_SHOW', 'PENDING', 'WAITING', 'IN_PROGRESS', 'CANCELLED',
      ],
      default: 'REQUESTED',
    },
    owner_snapshot: {
      full_name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    pet_snapshot: {
      name: { type: String, default: '' },
      species: { type: String, default: '' },
      breed: { type: String, default: '' },
      allergies: { type: [String], default: [] },
      special_notes: { type: String, default: '' },
    },
    service_snapshot: {
      name: { type: String, default: '' },
      price: { type: Number, min: 0 },
      duration_minutes: { type: Number, min: 1 },
      requires_vet_license: { type: Boolean, default: false },
    },
    customer_notes: { type: String, default: '' },
    deposit_required: { type: Number, default: 0, min: 0 },
    deposit_paid: { type: Number, default: 0, min: 0 },
    deposit_status: { type: String, enum: ['PAID', 'FORFEITED', 'NONE', 'REFUNDED', 'PENDING'], default: 'NONE' },
    slot_key: { type: String, default: '' },
    reservation_keys: { type: [String], default: undefined },
    created_by: { type: mongoose.Schema.Types.Mixed },
    requested_at: { type: Date, default: Date.now },
    confirmed_at: Date,
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'appointments' }
);

appointmentSchema.index({ owner_id: 1, createdAt: -1 });
appointmentSchema.index({ staff_id: 1, appointment_date: 1, status: 1 });
appointmentSchema.index({ reservation_keys: 1 }, { unique: true, sparse: true });

appointmentSchema.set('toJSON', {
  transform(doc, ret) {
    const id = ret._id.toString();
    const staff = ret.staff_id;
    ret.id = id;
    ret.code = ret.code || id;
    ret.patientId = ret.owner_id?.toString();
    ret.patientName = ret.owner_snapshot?.full_name || '';
    ret.petName = ret.pet_snapshot?.name || '';
    ret.petBreed = ret.pet_snapshot?.breed || '';
    ret.doctorId = (staff?._id || staff)?.toString();
    ret.doctorName = staff?.full_name || '';
    ret.specialty = ret.service_snapshot?.name || '';
    ret.type = ret.service_snapshot?.name || '';
    ret.date = ret.appointment_date?.toLocaleDateString('en-GB', { timeZone: 'UTC' }) || '';
    ret.time = `${ret.start_time} - ${ret.end_time}`;
    ret.notes = ret.customer_notes || '';
    ret.careNotes = ret.customer_notes || '';
    ret.serviceSnapshot = {
      name: ret.service_snapshot?.name || '',
      price: ret.service_snapshot?.price,
      durationMinutes: ret.service_snapshot?.duration_minutes,
    };
    ret.petSnapshot = {
      name: ret.pet_snapshot?.name || '',
      species: ret.pet_snapshot?.species || '',
      breed: ret.pet_snapshot?.breed || '',
    };
    ret.customerSnapshot = ret.owner_snapshot;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Appointment = mongoose.model('Appointment', appointmentSchema, 'appointments');
