import mongoose from 'mongoose';

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 200000,
    },
    icon: {
      type: String,
      default: 'Activity',
    },
    room: {
      type: String,
      default: 'Phòng 201',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Specialty = mongoose.model('Specialty', specialtySchema);

