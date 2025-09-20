/**
 * Script to delete specific test users and their associated data
 * Users to delete: test 12 test, Test User, Faiz Alam
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define users to delete by their identifiable information
    const usersToDelete = [
      { firstName: 'test', lastName: '12 test' }, // test 12 test
      { firstName: 'Test', lastName: 'User' },    // Test User
      { firstName: 'Faiz', lastName: 'Alam' }     // Faiz Alam
    ];

    console.log('\n🗑️  Deleting Test Users\n');

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const userInfo of usersToDelete) {
      console.log(`🔍 Looking for user: ${userInfo.firstName} ${userInfo.lastName}`);
      
      // Find the user
      const user = await User.findOne({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName
      });

      if (user) {
        console.log(`   ✅ Found: ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
        console.log(`   📅 Created: ${user.createdAt}`);
        console.log(`   📋 Status: ${user.approvalStatus || 'unknown'}`);
        
        // Delete the user
        await User.deleteOne({ _id: user._id });
        console.log(`   🗑️  Deleted successfully!\n`);
        deletedCount++;
      } else {
        console.log(`   ❌ User not found\n`);
        notFoundCount++;
      }
    }

    // Summary
    console.log('📊 Deletion Summary:');
    console.log(`✅ Successfully deleted: ${deletedCount} users`);
    console.log(`❌ Not found: ${notFoundCount} users`);

    // Show remaining users for verification
    console.log('\n👥 Remaining Users in Database:');
    const remainingUsers = await User.find({})
      .select('firstName lastName email role approvalStatus createdAt')
      .sort({ createdAt: -1 });

    console.log(`Total remaining users: ${remainingUsers.length}\n`);

    remainingUsers.forEach((user, index) => {
      const status = user.approvalStatus || 'unknown';
      const statusIcon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : status === 'rejected' ? '❌' : '❓';
      
      console.log(`${index + 1}. ${statusIcon} ${user.firstName} ${user.lastName}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toDateString()}`);
      console.log(`   📋 Status: ${status}`);
      console.log('-'.repeat(50));
    });

    console.log('\n🎉 Test user cleanup completed!');

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the deletion script
deleteTestUsers();