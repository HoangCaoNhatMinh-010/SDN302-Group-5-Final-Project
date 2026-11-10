import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'VET', 'GROOMER', 'RECEPTIONIST'],
      required: true,
    },
    has_vet_license: { type: Boolean, default: false },
    vet_license_number: { type: String, sparse: true },
    vet_license_expiry: { type: Date },
    service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    avatar_url: { type: String },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'staff' }
);

staffSchema.index({ phone: 1 }, { unique: true });
staffSchema.index({ role: 1, is_active: 1 });
staffSchema.index({ service_ids: 1 });

export default mongoose.models.Staff || mongoose.model('Staff', staffSchema);