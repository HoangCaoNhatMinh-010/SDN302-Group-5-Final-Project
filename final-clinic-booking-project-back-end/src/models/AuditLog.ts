import mongoose, { Document, Schema } from "mongoose";

export interface AuditLogDocument extends Document {
  actor: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, maxlength: 100 },
    resource: { type: String, required: true, maxlength: 100 },
    resourceId: { type: String, maxlength: 100 },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
