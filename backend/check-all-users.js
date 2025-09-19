/**
 * Check all users and their approval status
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAllUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const allUsers = await User.find({})
      .select('firstName lastName email role isApproved approvalStatus approvalDate createdAt')
      .sort({ createdAt: -1 });

    console.log(`\nTotal users in database: ${allUsers.length}\n`);

    if (allUsers.length === 0) {
      console.log('No users found in the database');
      return;
    }

    // Group users by approval status
    const approved = allUsers.filter(u => u.approvalStatus === 'approved' || u.isApproved === true);
    const pending = allUsers.filter(u => u.approvalStatus === 'pending' || (!u.isApproved && u.approvalStatus !== 'rejected'));
    const rejected = allUsers.filter(u => u.approvalStatus === 'rejected');
    const noStatus = allUsers.filter(u => !u.approvalStatus && u.isApproved === undefined);

    console.log('📊 User Status Summary:');
    console.log(`✅ Approved: ${approved.length} users`);
    console.log(`⏳ Pending: ${pending.length} users`);
    console.log(`❌ Rejected: ${rejected.length} users`);
    console.log(`❓ No Status: ${noStatus.length} users\n`);

    console.log('👥 All Users Details:');
    console.log('='.repeat(100));
    
    allUsers.forEach((user, index) => {
      const status = user.approvalStatus || (user.isApproved ? 'approved' : 'unknown');
      const statusIcon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : status === 'rejected' ? '❌' : '❓';
      const approvalInfo = user.approvalDate ? ` (Approved: ${user.approvalDate.toDateString()})` : '';
      
      console.log(`${index + 1}. ${statusIcon} ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📋 Status: ${status}${approvalInfo}`);
      console.log(`   📅 Created: ${user.createdAt.toDateString()}`);
      console.log(`   🔍 isApproved: ${user.isApproved}, approvalStatus: ${user.approvalStatus || 'null'}`);
      console.log('-'.repeat(80));
    });

    // Find users that might need approval (have no clear status)
    const needsReview = allUsers.filter(u => 
      !u.approvalStatus || 
      (u.approvalStatus === 'pending') || 
      (u.isApproved === false && u.approvalStatus !== 'rejected')
    );

    if (needsReview.length > 0) {
      console.log(`\n⚠️  Users that might need review: ${needsReview.length}`);
      needsReview.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the check
checkAllUsers();