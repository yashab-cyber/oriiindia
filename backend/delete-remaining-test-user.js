/**
 * Delete the remaining test user by email
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteRemainingTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n🔍 Looking for remaining test user by email: admin@ieca.in\n');
    
    // Find the user by email
    const user = await User.findOne({ email: 'admin@ieca.in' });

    if (user) {
      console.log(`✅ Found: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log(`   📋 Status: ${user.approvalStatus || 'unknown'}`);
      
      // Delete the user
      await User.deleteOne({ _id: user._id });
      console.log(`   🗑️  Deleted successfully!\n`);
    } else {
      console.log('❌ User not found\n');
    }

    // Show final user count
    const finalCount = await User.countDocuments({});
    console.log(`📊 Final user count: ${finalCount} users remaining`);

    // Show remaining users
    const remainingUsers = await User.find({})
      .select('firstName lastName email role')
      .sort({ createdAt: -1 });

    console.log('\n👥 Final User List:');
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
deleteRemainingTestUser();