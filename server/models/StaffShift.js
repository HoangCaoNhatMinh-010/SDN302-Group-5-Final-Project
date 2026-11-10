import mongoose from 'mongoose';

const staffShiftSchema = new mongoose.Schema(
  {
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    work_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_blocked: { type: Boolean, default: false },
    schema_version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'staff_shifts' }
);

staffShiftSchema.index({ staff_id: 1, work_date: 1, start_time: 1 });

export const StaffShift = mongoose.model('StaffShift', staffShiftSchema);
