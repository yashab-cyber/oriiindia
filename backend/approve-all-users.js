/**
 * Migration Script: Approve all existing pending users
 * Run this to approve all users who are currently pending approval
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const approveAllPendingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all pending users (including those without explicit status but not approved)
    const pendingUsers = await User.find({
      $or: [
        { approvalStatus: 'pending' },
        { 
          $and: [
            { isApproved: { $ne: true } },
            { approvalStatus: { $ne: 'rejected' } }
          ]
        }
      ]
    }).select('firstName lastName email role approvalStatus isApproved');

    console.log(`\nFound ${pendingUsers.length} pending users:`);
    
    if (pendingUsers.length === 0) {
      console.log('No pending users found to approve');
      return;
    }

    // List all pending users before approval
    console.log('\nPending users to be approved:');
    pendingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    // Ask for confirmation (in a real environment, you might want to add confirmation logic)
    console.log(`\nApproving all ${pendingUsers.length} pending users...`);

    // Get the first admin user to act as the approver
    const adminUser = await User.findOne({ role: 'admin' });
    const approverId = adminUser ? adminUser._id : null;

    if (!adminUser) {
      console.log('Warning: No admin user found to set as approver');
    } else {
      console.log(`Using admin ${adminUser.firstName} ${adminUser.lastName} as approver`);
    }

    // Approve all pending users
    const result = await User.updateMany(
      {
        $or: [
          { approvalStatus: 'pending' },
          { 
            $and: [
              { isApproved: { $ne: true } },
              { approvalStatus: { $ne: 'rejected' } }
            ]
          }
        ]
      },
      {
        $set: {
          isApproved: true,
          approvalStatus: 'approved',
          approvalDate: new Date(),
          ...(approverId && { approvedBy: approverId })
        }
      }
    );

    console.log(`\n✅ Successfully approved ${result.modifiedCount} users!`);

    // Show final status
    const allUsers = await User.find({}).select('firstName lastName email role approvalStatus');
    const approvedCount = allUsers.filter(u => u.approvalStatus === 'approved').length;
    const pendingCount = allUsers.filter(u => u.approvalStatus === 'pending').length;
    const rejectedCount = allUsers.filter(u => u.approvalStatus === 'rejected').length;

    console.log('\n📊 Final User Status Summary:');
    console.log(`- Approved: ${approvedCount} users`);
    console.log(`- Pending: ${pendingCount} users`);
    console.log(`- Rejected: ${rejectedCount} users`);
    console.log(`- Total: ${allUsers.length} users`);

    console.log('\n👥 All approved users:');
    const approvedUsers = allUsers.filter(u => u.approvalStatus === 'approved');
    approvedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the migration
approveAllPendingUsers();