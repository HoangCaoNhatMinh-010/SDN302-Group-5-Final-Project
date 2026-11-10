import mongoose from 'mongoose';

const staffShiftSchema = new mongoose.Schema(
  {
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    work_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_blocked: { type: Boolean, default: false },
    block_reason: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'staff_shifts' }
);

staffShiftSchema.index({ staff_id: 1, work_date: 1 });
staffShiftSchema.index({ work_date: 1, is_blocked: 1 });

export default mongoose.models.StaffShift || mongoose.model('StaffShift', staffShiftSchema);