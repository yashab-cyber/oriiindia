'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import {
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  isFirstLogin: boolean;
}

interface Attendance {
  _id: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  workingHours: number;
  isLateArrival: boolean;
  isEarlyDeparture: boolean;
  formattedCheckIn: string;
  formattedCheckOut?: string;
}

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  totalWorkingHours: number;
}

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceSummary | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
    getCurrentLocation();
  }, []);

  const checkAuthAndLoadData = async () => {
    const token = localStorage.getItem('employeeToken');
    const employeeData = localStorage.getItem('employee');

    if (!token || !employeeData) {
      router.push('/employee/login');
      return;
    }

    setEmployee(JSON.parse(employeeData));
    await fetchDashboardData();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(getApiUrl('/employee/dashboard'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.data.todayAttendance);
        setMonthlyAttendance(data.data.monthlyAttendance);
        setRecentAttendance(data.data.recentAttendance);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(getApiUrl('/attendance/checkin'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location?.latitude,
          longitude: location?.longitude,
          address: 'Office Location' // You can implement reverse geocoding here
        }),
      });

      if (response.ok) {
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await fetch(getApiUrl('/attendance/checkout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location?.latitude,
          longitude: location?.longitude,
          address: 'Office Location'
        }),
      });

      if (response.ok) {
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to check out');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employee');
    router.push('/employee/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'half-day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {employee?.name}</h1>
            <p className="text-gray-600 mt-1">{employee?.position} • {employee?.department}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Today's Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-6 w-6 mr-3 text-blue-500" />
              Today's Attendance
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {todayAttendance?.formattedCheckIn || '--:--'}
                </div>
                <div className="text-sm text-gray-600 mb-4">Check In</div>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || !!todayAttendance}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkingIn ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  )}
                  {todayAttendance ? 'Checked In' : 'Check In'}
                </button>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {todayAttendance?.formattedCheckOut || '--:--'}
                </div>
                <div className="text-sm text-gray-600 mb-4">Check Out</div>
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut || !todayAttendance || !!todayAttendance?.checkOutTime}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checkingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                  )}
                  {todayAttendance?.checkOutTime ? 'Checked Out' : 'Check Out'}
                </button>
              </div>
            </div>

            {todayAttendance && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(todayAttendance.status)}`}>
                      {todayAttendance.status.toUpperCase()}
                    </span>
                    {todayAttendance.isLateArrival && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                        Late Arrival
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Working Hours: {todayAttendance.workingHours.toFixed(1)}h
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              This Month
            </h3>
            {monthlyAttendance && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attendance</span>
                  <span className="text-sm font-semibold text-green-600">
                    {monthlyAttendance.attendancePercentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Present Days</span>
                  <span className="text-sm font-semibold">{monthlyAttendance.presentDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Late Days</span>
                  <span className="text-sm font-semibold text-orange-600">{monthlyAttendance.lateDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Working Hours</span>
                  <span className="text-sm font-semibold">
                    {monthlyAttendance.totalWorkingHours.toFixed(1)}h
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-3 text-blue-500" />
              Recent Attendance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAttendance.map((attendance, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(attendance.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.formattedCheckIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.formattedCheckOut || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.workingHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(attendance.status)}`}>
                          {attendance.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentAttendance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;