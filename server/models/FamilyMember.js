import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine_name: { type: String, trim: true },
    vaccinated_at: Date,
    next_due_date: Date,
    lot_number: { type: String, trim: true },
  },
  { _id: true }
);

const familyMemberSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ['dog', 'cat', 'rabbit'], required: true },
    breed: { type: String, trim: true, default: 'Unknown' },
    birth_date: Date,
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    weight_kg: { type: Number, min: 0, max: 200 },
    color: { type: String, default: '' },
    is_neutered: { type: Boolean, default: false },
    allergies: { type: [String], default: [] },
    special_notes: { type: String, default: '' },
    pet_tag: { type: String, default: '' },
    vaccinations: { type: [vaccinationSchema], default: [] },
    next_vaccine_due_date: Date,
    is_active: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'pets' }
);

familyMemberSchema.index({ owner_id: 1, createdAt: -1 });

familyMemberSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.patientId = ret.owner_id?.toString();
    ret.petType = { dog: 'Chó', cat: 'Mèo', rabbit: 'Khác' }[ret.species] || 'Khác';
    ret.relationship = ret.petType;
    ret.weight = ret.weight_kg;
    ret.dateOfBirth = ret.birth_date;
    ret.genderCode = ret.gender;
    ret.gender = { male: 'Đực', female: 'Cái', unknown: 'Khác' }[ret.gender] || ret.gender;
    ret.note = ret.special_notes;
    ret.idCard = ret.pet_tag;
    ret.isActive = ret.is_active;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema, 'pets');
