import mongoose, { Document, Schema } from "mongoose";

export interface SpecialtyDocument extends Document {
  name: string;
  description?: string;
  active: boolean;
}

const specialtySchema = new Schema<SpecialtyDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Specialty = mongoose.model<SpecialtyDocument>("Specialty", specialtySchema);
