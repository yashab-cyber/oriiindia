/**
 * Approve the remaining pending user
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const approveRemainingUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the pending user
    const pendingUser = await User.findOne({ email: 'admin@ieca.in' });
    
    if (!pendingUser) {
      console.log('No pending user found with email admin@ieca.in');
      return;
    }

    console.log(`Found pending user: ${pendingUser.firstName} ${pendingUser.lastName} (${pendingUser.email})`);
    console.log(`Current status: ${pendingUser.approvalStatus}, isApproved: ${pendingUser.isApproved}`);

    // Get admin to set as approver
    const adminUser = await User.findOne({ role: 'admin' });

    // Update the user to approved
    await User.updateOne(
      { email: 'admin@ieca.in' },
      {
        $set: {
          isApproved: true,
          approvalStatus: 'approved',
          approvalDate: new Date(),
          ...(adminUser && { approvedBy: adminUser._id })
        }
      }
    );

    console.log('✅ User approved successfully!');

    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@ieca.in' }).select('firstName lastName email approvalStatus isApproved');
    console.log(`Updated status: ${updatedUser.approvalStatus}, isApproved: ${updatedUser.isApproved}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
approveRemainingUser();