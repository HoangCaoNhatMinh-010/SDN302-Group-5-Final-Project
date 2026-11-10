import mongoose from 'mongoose';

const medicalNoteSchema = new mongoose.Schema(
  {
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
      index: true,
    },
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    symptoms: { type: String, default: '' },
    diagnosis: { type: String, default: '' },
    prescription: { type: String, default: '' },
    allergies_noted: { type: [String], default: [] },
    attachments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'medical_notes' }
);

export const MedicalNote = mongoose.model('MedicalNote', medicalNoteSchema);
