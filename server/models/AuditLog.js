import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor_id: { type: mongoose.Schema.Types.ObjectId },
    actor_type: { type: String, enum: ['OWNER', 'STAFF', 'SYSTEM'] },
    action: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: mongoose.Schema.Types.ObjectId },
    changes: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  { collection: 'audit_logs' }
);

auditLogSchema.index({ created_at: -1 }, { expireAfterSeconds: 365 * 24 * 3600 });
auditLogSchema.index({ actor_id: 1, created_at: -1 });
auditLogSchema.index({ entity_type: 1, entity_id: 1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);