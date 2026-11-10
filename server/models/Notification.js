import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['appointment', 'checkin', 'system', 'general'],
      default: 'appointment',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (ret.userId) {
          ret.userId = ret.userId._id ? ret.userId._id.toString() : ret.userId.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);

