import mongoose, { Document, Schema } from "mongoose";

export type SlotStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";

export interface ScheduleSlot {
  startAt: Date;
  endAt: Date;
  status: SlotStatus;
}

export interface ScheduleDocument extends Document {
  doctor: mongoose.Types.ObjectId;
  date: string;
  slots: ScheduleSlot[];
  note?: string;
  createdBy: mongoose.Types.ObjectId;
}

const slotSchema = new Schema<ScheduleSlot>(
  {
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: { type: String, enum: ["AVAILABLE", "BOOKED", "BLOCKED"], default: "AVAILABLE" },
  },
  { _id: false }
);

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
    date: { type: String, required: true, index: true },
    slots: { type: [slotSchema], default: [] },
    note: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

scheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

export const Schedule = mongoose.model<ScheduleDocument>("Schedule", scheduleSchema);
