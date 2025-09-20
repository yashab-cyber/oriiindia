'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalPapers: number;
    totalJobs: number;
    totalEvents: number;
    totalApplications: number;
    monthlyGrowth: {
      users: number;
      papers: number;
      jobs: number;
      applications: number;
    };
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: {
      student: number;
      faculty: number;
      admin: number;
      researcher: number;
    };
    userGrowthByMonth: Array<{
      month: string;
      count: number;
    }>;
  };
  paperStats: {
    totalPapers: number;
    pendingPapers: number;
    approvedPapers: number;
    rejectedPapers: number;
    papersByCategory: Array<{
      category: string;
      count: number;
    }>;
    recentSubmissions: Array<{
      title: string;
      author: string;
      status: string;
      submittedAt: string;
    }>;
  };
  jobStats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    applicationsByStatus: {
      pending: number;
      reviewed: number;
      shortlisted: number;
      rejected: number;
    };
    jobsByDepartment: Array<{
      department: string;
      count: number;
    }>;
    topJobs: Array<{
      title: string;
      department: string;
      applications: number;
    }>;
  };
  eventStats: {
    totalEvents: number;
    upcomingEvents: number;
    pastEvents: number;
    eventsByType: Array<{
      type: string;
      count: number;
    }>;
  };
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const router = useRouter();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  useEffect(() => {
    checkAdminAccess();
    fetchAnalyticsData();
  }, [dateRange]);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/admin/analytics?days=${dateRange}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        console.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!analyticsData) return {
      userRolesData: [],
      paperStatusData: [],
      applicationStatusData: [],
      departmentData: []
    };

    // User roles data for pie chart
    const userRolesData = Object.entries(analyticsData.userStats.usersByRole).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count
    }));

    // Paper status data for pie chart
    const paperStatusData = [
      { name: 'Approved', value: analyticsData.paperStats.approvedPapers },
      { name: 'Pending', value: analyticsData.paperStats.pendingPapers },
      { name: 'Rejected', value: analyticsData.paperStats.rejectedPapers }
    ];

    // Application status data for bar chart
    const applicationStatusData = Object.entries(analyticsData.jobStats.applicationsByStatus).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));

    // Department data for bar chart
    const departmentData = analyticsData.jobStats.jobsByDepartment.map((dept: any) => ({
      department: dept.department,
      jobs: dept.count
    }));

    return {
      userRolesData,
      paperStatusData,
      applicationStatusData,
      departmentData
    };
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500'
    };

    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-3xl font-bold text-gray-900">{value}</div>
                  {change !== undefined && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change >= 0 ? (
                        <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                      )}
                      <span className="ml-1">{Math.abs(change)}%</span>
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl text-gray-700">Failed to load analytics data</div>
        </div>
      </div>
    );
  }

  const chartData = formatChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">Comprehensive platform insights and statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analyticsData.overview.totalUsers.toLocaleString()}
            change={analyticsData.overview.monthlyGrowth.users}
            icon={UsersIcon}
            color="blue"
          />
          <StatCard
            title="Research Papers"
            value={analyticsData.overview.totalPapers.toLocaleString()}
            change={analyticsData.overview.monthlyGrowth.papers}
            icon={DocumentTextIcon}
            color="green"
          />
          <StatCard
            title="Job Postings"
            value={analyticsData.overview.totalJobs.toLocaleString()}
            change={analyticsData.overview.monthlyGrowth.jobs}
            icon={BriefcaseIcon}
            color="purple"
          />
          <StatCard
            title="Job Applications"
            value={analyticsData.overview.totalApplications.toLocaleString()}
            change={analyticsData.overview.monthlyGrowth.applications}
            icon={DocumentTextIcon}
            color="yellow"
          />
          <StatCard
            title="Events"
            value={analyticsData.overview.totalEvents.toLocaleString()}
            icon={CalendarIcon}
            color="indigo"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Roles Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UsersIcon className="h-6 w-6 mr-3 text-blue-500" />
              Users by Role
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.userRolesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.userRolesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Paper Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-3 text-green-500" />
              Paper Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.paperStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.paperStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Application Status Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BriefcaseIcon className="h-6 w-6 mr-3 text-purple-500" />
              Application Status
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.applicationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Jobs by Department Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-3 text-indigo-500" />
              Jobs by Department
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="jobs" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Jobs and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Jobs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 mr-3 text-green-500" />
              Top Job Postings
            </h3>
            <div className="space-y-4">
              {analyticsData.jobStats.topJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div>
                    <div className="font-semibold text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.department}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{job.applications}</div>
                    <div className="text-xs text-gray-500">applications</div>
                  </div>
                </div>
              ))}
              {analyticsData.jobStats.topJobs.length === 0 && (
                <div className="text-center text-gray-500 py-8">No job data available</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <EyeIcon className="h-6 w-6 mr-3 text-indigo-500" />
              Quick Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analyticsData.userStats.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{analyticsData.jobStats.activeJobs}</div>
                <div className="text-sm text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{analyticsData.paperStats.pendingPapers}</div>
                <div className="text-sm text-gray-600">Pending Papers</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{analyticsData.eventStats.upcomingEvents}</div>
                <div className="text-sm text-gray-600">Upcoming Events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-6 w-6 mr-3 text-indigo-500" />
              Recent Paper Submissions
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.paperStats.recentSubmissions.map((paper, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{paper.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          paper.status === 'approved' ? 'bg-green-100 text-green-800' :
                          paper.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(paper.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {analyticsData.paperStats.recentSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No recent submissions
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

export default AdminAnalytics;