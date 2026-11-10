import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    type: {
      type: String,
      enum: ['DATA_PROCESSING', 'MARKETING', 'SHARE_WITH_VET', 'RECORDING'],
      required: true,
    },
    granted: { type: Boolean, required: true },
    granted_at: { type: Date },
    revoked_at: { type: Date },
    ip_address: { type: String },
    user_agent: { type: String },
    version: { type: String, default: '1.0' },
  },
  { timestamps: true, collection: 'consents' }
);

consentSchema.index({ owner_id: 1, type: 1, granted: 1 });

export default mongoose.models.Consent || mongoose.model('Consent', consentSchema);