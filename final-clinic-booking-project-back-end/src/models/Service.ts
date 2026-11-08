import mongoose, { Document, Schema } from "mongoose";

export interface ServiceDocument extends Document {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

const serviceSchema = new Schema<ServiceDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model<ServiceDocument>("Service", serviceSchema);
