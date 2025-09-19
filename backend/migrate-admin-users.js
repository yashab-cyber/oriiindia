/**
 * Migration Script: Auto-approve existing admin users
 * Run this once to ensure all existing admin users are approved
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all admin users who are not approved
    const unapprovedAdmins = await User.find({
      role: 'admin',
      $or: [
        { isApproved: false },
        { approvalStatus: { $ne: 'approved' } }
      ]
    });

    console.log(`Found ${unapprovedAdmins.length} unapproved admin users`);

    if (unapprovedAdmins.length === 0) {
      console.log('No admin users need approval updates');
      return;
    }

    // Update all admin users to be approved
    const result = await User.updateMany(
      {
        role: 'admin',
        $or: [
          { isApproved: false },
          { approvalStatus: { $ne: 'approved' } }
        ]
      },
      {
        $set: {
          isApproved: true,
          approvalStatus: 'approved',
          approvalDate: new Date()
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} admin users to approved status`);

    // List the updated admins
    const updatedAdmins = await User.find({ role: 'admin' }).select('firstName lastName email approvalStatus');
    console.log('All admin users:');
    updatedAdmins.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.approvalStatus}`);
    });

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
migrateAdminUsers();