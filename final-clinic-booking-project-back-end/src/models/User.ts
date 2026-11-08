import mongoose, { Document, PassportLocalModel, Schema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

export const USER_ROLES = ["PATIENT", "RECEPTIONIST", "DOCTOR", "MANAGER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserDocument extends Document {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  active: boolean;
  authVersion: number;
  dateOfBirth?: Date;
  gender?: "FEMALE" | "MALE" | "OTHER";
  address?: string;
  doctorProfile?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    role: { type: String, enum: USER_ROLES, default: "PATIENT", required: true },
    active: { type: Boolean, default: true },
    authVersion: { type: Number, default: 0 },
    dateOfBirth: Date,
    gender: { type: String, enum: ["FEMALE", "MALE", "OTHER"] },
    address: { type: String, trim: true, maxlength: 500 },
    doctorProfile: { type: Schema.Types.ObjectId, ref: "DoctorProfile" },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "phone",
  usernameUnique: true,
  errorMessages: { UserExistsError: "Số điện thoại đã được đăng ký." },
});

export const User = mongoose.model<UserDocument, PassportLocalModel<UserDocument>>("User", userSchema);
