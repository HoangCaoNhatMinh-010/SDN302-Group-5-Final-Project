import mongoose, { Document, Schema } from "mongoose";

export interface DoctorProfileDocument extends Document {
  user: mongoose.Types.ObjectId;
  specialty: mongoose.Types.ObjectId;
  biography?: string;
  yearsOfExperience: number;
  consultationFee: number;
  active: boolean;
}

const doctorProfileSchema = new Schema<DoctorProfileDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty: { type: Schema.Types.ObjectId, ref: "Specialty", required: true, index: true },
    biography: { type: String, trim: true, maxlength: 3000 },
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    consultationFee: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DoctorProfile = mongoose.model<DoctorProfileDocument>("DoctorProfile", doctorProfileSchema);
