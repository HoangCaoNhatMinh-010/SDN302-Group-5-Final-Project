import mongoose, { Document, Schema } from "mongoose";

export interface NotificationDocument extends Document {
  recipient: mongoose.Types.ObjectId;
  channel: "IN_APP" | "SMS" | "EMAIL";
  title: string;
  message: string;
  readAt?: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    channel: { type: String, enum: ["IN_APP", "SMS", "EMAIL"], default: "IN_APP" },
    title: { type: String, required: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 2000 },
    readAt: Date,
  },
  { timestamps: true }
);

export const Notification = mongoose.model<NotificationDocument>("Notification", notificationSchema);
