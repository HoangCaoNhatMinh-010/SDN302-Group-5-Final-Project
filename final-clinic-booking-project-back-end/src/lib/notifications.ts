import ejs from "ejs";
import mongoose from "mongoose";
import { Notification } from "../models/Notification";

export async function notify(
  recipient: mongoose.Types.ObjectId,
  title: string,
  template: string,
  data: Record<string, unknown>
): Promise<void> {
  const message = ejs.render(template, data, { async: false });
  await Notification.create({ recipient, title, message, channel: "IN_APP" });
}
