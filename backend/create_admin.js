// Admin user creation script
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/index.js';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin user details
    const adminData = {
      firstName: 'Yasha',
      lastName: 'Balam',
      email: 'yashabalam707@gmail.com',
      password: '@Yashab07',
      role: 'admin'
    };

    // Check if admin already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('User already exists with this email:', adminData.email);
      console.log('Current role:', existingUser.role);
      
      if (existingUser.role !== 'admin') {
        // Update role to admin
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Updated user role to admin');
      } else {
        console.log('User is already an admin');
      }
      return;
    }

    // Create new admin user
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Role:', adminUser.role);
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdmin();