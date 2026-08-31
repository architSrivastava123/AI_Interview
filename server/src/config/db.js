/**
 * db.js
 * Configures Mongoose connection to MongoDB with Serverless Connection Caching.
 */

import mongoose from 'mongoose';
import { env } from './env.js';

let cachedConnection = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set. Database queries will not persist.');
    return null;
  }

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState >= 1) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('MongoDB disconnected');
  }
}
