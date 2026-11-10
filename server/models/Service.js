import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['grooming', 'vet', 'boarding', 'other'], required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    duration_minutes: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },
    deposit_amount: { type: Number, default: 0, min: 0 },
    requires_vet_license: { type: Boolean, default: false },
    allow_online_booking: { type: Boolean, default: true },
    requires_pre_assessment: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'services' }
);

serviceSchema.index({ category: 1, is_active: 1, display_order: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);