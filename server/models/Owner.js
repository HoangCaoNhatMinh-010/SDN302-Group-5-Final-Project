import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, default: '' },
    date_of_birth: { type: Date },
    gender: { type: String, enum: ['female', 'male', 'other'] },
    is_active: { type: Boolean, default: true },
    loyalty_points: { type: Number, default: 0, min: 0 },
    total_spent: { type: Number, default: 0, min: 0 },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'owners' }
);

ownerSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.name = ret.full_name;
    ret.dateOfBirth = ret.date_of_birth;
    ret.isActive = ret.is_active;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Owner = mongoose.model('Owner', ownerSchema);
