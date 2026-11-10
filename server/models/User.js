import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = [
  'PET_OWNER',
  'RECEPTIONIST',
  'GROOMER',
  'VET_DOCTOR',
  'MANAGER',
  'ADMIN',
];

const userAccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true },
    patientCode: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
    ownerLinkStatus: { type: String, enum: ['LINKED', 'PENDING'], default: 'LINKED' },
    title: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform(_document, returned) {
        delete returned.password;
        return returned;
      },
    },
  }
);

userAccountSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userAccountSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model('User', userAccountSchema);
