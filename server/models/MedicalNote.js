import mongoose from 'mongoose';

const medicalNoteSchema = new mongoose.Schema(
  {
    pet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', sparse: true },
    diagnosis: { type: String },
    prescription: { type: String },
    symptoms: { type: String },
    allergies_noted: [{ type: String }],
    behavior_notes: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    attachments: [{ type: String }],
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'medical_notes' }
);

medicalNoteSchema.index({ pet_id: 1, created_at: -1 });
medicalNoteSchema.index({ appointment_id: 1 }, { sparse: true });
medicalNoteSchema.index({ created_by: 1, created_at: -1 });

export default mongoose.models.MedicalNote || mongoose.model('MedicalNote', medicalNoteSchema);