import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawcare_db';
  const conn = await mongoose.connect(uri);
  console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};
