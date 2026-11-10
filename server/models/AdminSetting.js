import mongoose from 'mongoose';

export const ADMIN_SETTING_SECTIONS = [
  'services',
  'slot-config',
  'policies',
  'consent',
  'integrations',
  'reminders',
];

const adminSettingSchema = new mongoose.Schema(
  {
    section: { type: String, enum: ADMIN_SETTING_SECTIONS, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    enabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'admin_settings' }
);

adminSettingSchema.index({ section: 1, name: 1 }, { unique: true });

export default mongoose.models.AdminSetting
  || mongoose.model('AdminSetting', adminSettingSchema);
