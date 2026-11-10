import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['GROOMER', 'VET', 'RECEPTIONIST'], default: 'GROOMER' },
    service_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    password_hash: { type: String, select: false },
    has_vet_license: { type: Boolean, default: false },
    vet_license_number: { type: String, default: '' },
    vet_license_expiry: Date,
    is_active: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
    avatar: { type: String, default: '' },
    title: { type: String, default: 'Chuyên viên chăm sóc thú cưng' },
    department: { type: String, default: 'Tổ Spa & Grooming' },
    room: { type: String, default: 'Khu Spa & Grooming' },
    experience_years: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    available_days: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'staff' }
);

doctorSchema.virtual('name')
  .get(function () { return this.full_name; })
  .set(function (value) { this.full_name = value; });
doctorSchema.virtual('serviceIds')
  .get(function () { return this.service_ids; })
  .set(function (value) { this.service_ids = value; });
doctorSchema.virtual('isActive')
  .get(function () { return this.is_active; })
  .set(function (value) { this.is_active = value; });
doctorSchema.virtual('experienceYears')
  .get(function () { return this.experience_years; })
  .set(function (value) { this.experience_years = value; });
doctorSchema.virtual('specialty')
  .get(function () {
    const firstService = this.service_ids?.[0];
    return firstService && typeof firstService === 'object' ? firstService.name : '';
  });

doctorSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.specialty = ret.service_ids?.find((service) => service && typeof service === 'object')?.name || '';
    delete ret._id;
    delete ret.__v;
    delete ret.password_hash;
    return ret;
  },
});

export const Doctor = mongoose.model('Doctor', doctorSchema, 'staff');
