import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true, match: /^0\d{9}$/ },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    address: { type: String, trim: true },
    date_of_birth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    loyalty_points: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'owners' }
);

ownerSchema.index({ phone: 1 }, { unique: true });
ownerSchema.index({ email: 1 }, { sparse: true });
ownerSchema.index({ deleted_at: 1 }, { sparse: true });

export default mongoose.models.Owner || mongoose.model('Owner', ownerSchema);