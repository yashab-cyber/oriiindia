/**
 * Test script to verify user approval system
 * 1. Create a new test user
 * 2. Check if they appear in public endpoints
 * 3. Check if they appear in admin pending list
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testUserApprovalSystem = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\n🧪 Testing User Approval System\n');

    // Create a test user that should be pending approval
    const testUserData = {
      firstName: 'Test',
      lastName: 'Approval',
      email: 'test.approval@example.com',
      password: await bcrypt.hash('testpassword123', 12),
      role: 'researcher',
      isApproved: false,
      approvalStatus: 'pending',
      profile: {
        title: 'Test Researcher',
        department: 'Computer Science',
        bio: 'This is a test user for approval system',
        researchInterests: ['Testing', 'Approval Systems']
      }
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUserData.email });
    if (existingUser) {
      console.log('⚠️ Test user already exists, deleting first...');
      await User.deleteOne({ email: testUserData.email });
    }

    // Create the test user
    const testUser = new User(testUserData);
    await testUser.save();
    console.log('✅ Created test user:', testUser.firstName, testUser.lastName, '(Pending approval)');

    // Test 1: Check public users endpoint (should NOT include pending user)
    console.log('\n🔍 Test 1: Checking public users endpoint...');
    const publicUsers = await User.find({
      isActive: true,
      isApproved: true,
      approvalStatus: 'approved'
    }).select('firstName lastName email approvalStatus');

    const testUserInPublic = publicUsers.find(u => u.email === testUserData.email);
    
    if (testUserInPublic) {
      console.log('❌ FAIL: Test user appears in public endpoint when they should be pending');
    } else {
      console.log('✅ PASS: Test user correctly hidden from public endpoint');
    }

    console.log(`📊 Public users count: ${publicUsers.length}`);

    // Test 2: Check admin users endpoint (should NOT include pending user)
    console.log('\n🔍 Test 2: Checking admin users endpoint...');
    const adminUsers = await User.find({
      isApproved: true,
      approvalStatus: 'approved'
    }).select('firstName lastName email approvalStatus');

    const testUserInAdmin = adminUsers.find(u => u.email === testUserData.email);
    
    if (testUserInAdmin) {
      console.log('❌ FAIL: Test user appears in admin users list when they should be in pending');
    } else {
      console.log('✅ PASS: Test user correctly hidden from admin users list');
    }

    console.log(`📊 Admin approved users count: ${adminUsers.length}`);

    // Test 3: Check pending users endpoint (should include pending user)
    console.log('\n🔍 Test 3: Checking admin pending users endpoint...');
    const pendingUsers = await User.find({
      $or: [
        { approvalStatus: 'pending' },
        { isApproved: false, approvalStatus: { $ne: 'rejected' } }
      ]
    }).select('firstName lastName email approvalStatus');

    const testUserInPending = pendingUsers.find(u => u.email === testUserData.email);
    
    if (testUserInPending) {
      console.log('✅ PASS: Test user correctly appears in pending users list');
    } else {
      console.log('❌ FAIL: Test user missing from pending users list');
    }

    console.log(`📊 Pending users count: ${pendingUsers.length}`);

    // Show all users status for reference
    console.log('\n📋 All Users Status Summary:');
    const allUsers = await User.find({}).select('firstName lastName email role approvalStatus isApproved');
    
    const statusGroups = {
      approved: allUsers.filter(u => u.isApproved && u.approvalStatus === 'approved'),
      pending: allUsers.filter(u => !u.isApproved || u.approvalStatus === 'pending'),
      rejected: allUsers.filter(u => u.approvalStatus === 'rejected')
    };

    console.log(`✅ Approved users: ${statusGroups.approved.length}`);
    console.log(`⏳ Pending users: ${statusGroups.pending.length}`);
    console.log(`❌ Rejected users: ${statusGroups.rejected.length}`);

    console.log('\n📝 Pending Users List:');
    statusGroups.pending.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    // Clean up: Remove test user
    console.log('\n🧹 Cleaning up test user...');
    await User.deleteOne({ email: testUserData.email });
    console.log('✅ Test user removed');

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the test
testUserApprovalSystem();