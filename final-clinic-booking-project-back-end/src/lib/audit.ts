import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog";

export async function audit(
  actor: mongoose.Types.ObjectId,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await AuditLog.create({ actor, action, resource, resourceId, details });
}
