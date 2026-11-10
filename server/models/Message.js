import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channelType: {
      type: String,
      enum: ['STORE', 'STAFF', 'AI'],
      required: true,
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    sender: {
      type: String,
      enum: ['USER', 'STAFF', 'AI'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      default: null,
    },
    suggestedServiceName: {
      type: String,
      default: '',
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
        if (ret.staffId && typeof ret.staffId === 'object' && ret.staffId._id) {
          ret.staffId = ret.staffId._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Message = mongoose.model('Message', messageSchema);

