import mongoose, { Document, Schema } from "mongoose";

export const APPOINTMENT_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "IN_CONSULTATION",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface AppointmentDocument extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  schedule: mongoose.Types.ObjectId;
  service?: mongoose.Types.ObjectId;
  slotStart: Date;
  status: AppointmentStatus;
  reason?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  prescription?: string;
  checkedInAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
    schedule: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    slotStart: { type: Date, required: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "CONFIRMED", index: true },
    reason: { type: String, trim: true, maxlength: 1000 },
    diagnosis: { type: String, trim: true, maxlength: 2000 },
    clinicalNotes: { type: String, trim: true, maxlength: 5000 },
    prescription: { type: String, trim: true, maxlength: 5000 },
    checkedInAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

appointmentSchema.index({ schedule: 1, slotStart: 1 }, { unique: true });

export const Appointment = mongoose.model<AppointmentDocument>("Appointment", appointmentSchema);
