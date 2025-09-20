#!/usr/bin/env node

/**
 * Test script for the dual-role employee system
 * This script tests that both Employee records and User-employees can login and access employee features
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testDualRoleSystem() {
  console.log('🧪 Testing Dual-Role Employee System\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      phone: '+1234567890',
      affiliation: 'Test Company',
      position: 'Software Developer'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ User registered successfully');

    // Test 2: Admin login
    console.log('\n2️⃣ Testing admin login...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin logged in successfully');

    // Test 3: Get all users to find our test user
    console.log('\n3️⃣ Finding test user...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const testUser = usersResponse.data.data.users.find(user => user.email === userData.email);
    if (!testUser) {
      throw new Error('Test user not found');
    }
    console.log(`✅ Found test user: ${testUser._id}`);

    // Test 4: Assign employee role to user
    console.log('\n4️⃣ Assigning employee role to user...');
    const assignRoleResponse = await axios.patch(
      `${API_BASE}/admin/users/${testUser._id}/employee`,
      {
        isEmployee: true,
        department: 'IT',
        position: 'Developer',
        salary: 50000
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Employee role assigned successfully');

    // Test 5: User login to employee portal
    console.log('\n5️⃣ Testing user login to employee portal...');
    const employeeLoginResponse = await axios.post(`${API_BASE}/employee/login`, {
      email: userData.email,
      password: userData.password
    });
    
    const employeeToken = employeeLoginResponse.data.token;
    console.log('✅ User-employee logged in successfully');
    console.log(`   Employee ID: ${employeeLoginResponse.data.employee.employeeId}`);
    console.log(`   Is User-Employee: ${employeeLoginResponse.data.isUserEmployee}`);

    // Test 6: Access employee dashboard
    console.log('\n6️⃣ Testing employee dashboard access...');
    const dashboardResponse = await axios.get(`${API_BASE}/employee/dashboard`, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    console.log('✅ Employee dashboard accessed successfully');
    console.log(`   Employee Name: ${dashboardResponse.data.data.employee.name}`);
    console.log(`   Department: ${dashboardResponse.data.data.employee.department}`);

    // Test 7: Test attendance check-in
    console.log('\n7️⃣ Testing attendance check-in...');
    const checkinResponse = await axios.post(`${API_BASE}/attendance/checkin`, {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY',
      notes: 'Testing dual-role system'
    }, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    console.log('✅ Attendance check-in successful');

    // Test 8: Get today's attendance
    console.log('\n8️⃣ Testing attendance retrieval...');
    const todayAttendanceResponse = await axios.get(`${API_BASE}/attendance/today`, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    console.log('✅ Today\'s attendance retrieved successfully');
    console.log(`   Check-in time: ${todayAttendanceResponse.data.data.checkInTime}`);

    // Test 9: Change password
    console.log('\n9️⃣ Testing password change...');
    const changePasswordResponse = await axios.post(`${API_BASE}/employee/change-password`, {
      currentPassword: userData.password,
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    console.log('✅ Password changed successfully');

    console.log('\n🎉 All tests passed! Dual-role employee system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration');
    console.log('   ✅ Admin role assignment');
    console.log('   ✅ User-employee login');
    console.log('   ✅ Employee dashboard access');
    console.log('   ✅ Attendance tracking');
    console.log('   ✅ Password management');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run tests
testDualRoleSystem();