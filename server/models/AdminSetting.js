import mongoose from 'mongoose';

export const ADMIN_SETTING_SECTIONS = [
  'slot-config',
  'policies',
  'consent',
  'integrations',
  'reminders',
];

const adminSettingSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ADMIN_SETTING_SECTIONS,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

adminSettingSchema.index({ section: 1, name: 1 }, { unique: true });

adminSettingSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);
