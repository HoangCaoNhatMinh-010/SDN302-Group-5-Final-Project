import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine_name: { type: String, required: true },
    vaccinated_at: { type: Date, required: true },
    next_due_date: { type: Date },
    lot_number: { type: String },
    administered_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    clinic_name: { type: String },
    notes: { type: String },
  },
  { _id: true, timestamps: false }
);

const petSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true, index: true },
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ['dog', 'cat', 'rabbit', 'bird', 'other'], required: true },
    breed: { type: String, trim: true },
    birth_date: { type: Date },
    weight_kg: { type: Number, min: 0 },
    color: { type: String },
    gender: { type: String, enum: ['male', 'female', 'unknown'] },
    is_neutered: { type: Boolean, default: false },
    photo_url: { type: String },
    special_notes: { type: String },
    allergies: [{ type: String }],
    vaccinations: [vaccinationSchema],
    next_vaccine_due_date: { type: Date },
    is_active: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'pets' }
);

petSchema.index({ owner_id: 1, is_active: 1 });
petSchema.index({ name: 'text', breed: 'text' });
petSchema.index({ next_vaccine_due_date: 1 }, { sparse: true });

export default mongoose.models.Pet || mongoose.model('Pet', petSchema);