import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const dbURI = process.env.MONGO_URI as string;

    if (!dbURI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
