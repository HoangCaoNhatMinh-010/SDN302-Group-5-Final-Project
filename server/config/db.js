import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be configured before connecting to the application database.');
  }
  const conn = await mongoose.connect(uri, { autoIndex: false });
  // console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
  console.log(`Database in MongoDB had connected successfully.`);
  return conn;
};
