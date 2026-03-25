import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/db.js';
import User from '../src/models/User.js';

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const email = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`Admin already exists for ${email}`);
    } else {
      await User.create({
        name: process.env.ADMIN_SEED_NAME || 'System Admin',
        email,
        password: process.env.ADMIN_SEED_PASSWORD || 'Admin@123',
        role: 'admin'
      });

      console.log(`Admin seeded for ${email}`);
    }
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
