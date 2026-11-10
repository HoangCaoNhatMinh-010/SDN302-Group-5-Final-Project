import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: ['grooming', 'vet', 'boarding'], required: true, default: 'grooming' },
    price: { type: Number, required: true, min: 0 },
    duration_minutes: { type: Number, required: true, min: 15 },
    deposit_amount: { type: Number, default: 0, min: 0 },
    requires_pre_assessment: { type: Boolean, default: false },
    requires_vet_license: { type: Boolean, default: false },
    allow_online_booking: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
    description: { type: String, default: '' },
    room: { type: String, default: 'Khu Spa & Grooming' },
    icon: { type: String, default: 'Sparkles' },
    species: { type: [String], default: ['dog', 'cat', 'rabbit'] },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'services' }
);

specialtySchema.virtual('durationMinutes')
  .get(function () { return this.duration_minutes; })
  .set(function (value) { this.duration_minutes = value; });
specialtySchema.virtual('isActive')
  .get(function () { return this.is_active; })
  .set(function (value) { this.is_active = value; });
specialtySchema.virtual('depositAmount')
  .get(function () { return this.deposit_amount; })
  .set(function (value) { this.deposit_amount = value; });
specialtySchema.virtual('allowOnlineBooking')
  .get(function () { return this.allow_online_booking; })
  .set(function (value) { this.allow_online_booking = value; });
specialtySchema.virtual('requiresVetLicense')
  .get(function () { return this.requires_vet_license; })
  .set(function (value) { this.requires_vet_license = value; });

specialtySchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Specialty = mongoose.model('Specialty', specialtySchema, 'services');
