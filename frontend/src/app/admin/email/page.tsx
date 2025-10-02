'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, FileText, Send, BarChart3, History, Users, Plus, Eye, TrendingUp } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

const EmailManagementDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTemplates: 0,
    emailsSentToday: 0,
    emailsSentTotal: 0,
    deliveryRate: 0,
    recentEmails: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/auth/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      
      // Check if user is admin
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setUser(parsedUser);
      fetchEmailStats();
    };

    checkAdminAccess();
  }, [router]);

  const fetchEmailStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch email statistics
      const [templatesRes, analyticsRes] = await Promise.all([
        fetch(getApiUrl('/admin/email/templates'), {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(getApiUrl('/admin/email/analytics/dashboard'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setStats(prev => ({ ...prev, totalTemplates: templatesData.length }));
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setStats(prev => ({
          ...prev,
          emailsSentToday: analyticsData.emailsSentToday || 0,
          emailsSentTotal: analyticsData.totalEmailsSent || 0,
          deliveryRate: analyticsData.deliveryRate || 0
        }));
      }

    } catch (error) {
      console.error('Error fetching email stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Email Management...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Send Email',
      description: 'Send emails using templates',
      icon: Send,
      href: '/admin/email/send',
      color: 'bg-blue-500 hover:bg-blue-600',
      iconColor: 'text-white'
    },
    {
      title: 'Manage Templates',
      description: 'Create and edit email templates',
      icon: FileText,
      href: '/admin/email/templates',
      color: 'bg-green-500 hover:bg-green-600',
      iconColor: 'text-white'
    },
    {
      title: 'Bulk Email',
      description: 'Send emails to multiple recipients',
      icon: Users,
      href: '/admin/email/bulk',
      color: 'bg-purple-500 hover:bg-purple-600',
      iconColor: 'text-white'
    },
    {
      title: 'Email History',
      description: 'View all sent emails and logs',
      icon: History,
      href: '/admin/email/history',
      color: 'bg-orange-500 hover:bg-orange-600',
      iconColor: 'text-white'
    },
    {
      title: 'Analytics',
      description: 'Email performance and statistics',
      icon: BarChart3,
      href: '/admin/email/analytics',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      iconColor: 'text-white'
    }
  ];

  const statCards = [
    {
      title: 'Total Templates',
      value: stats.totalTemplates,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Emails Sent Today',
      value: stats.emailsSentToday,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Emails Sent',
      value: stats.emailsSentTotal,
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Delivery Rate',
      value: `${stats.deliveryRate}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Mail className="mr-3 h-8 w-8 text-blue-600" />
                  Email Management
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage email templates, send campaigns, and track performance
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600">Access key email management features</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="group block p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center mb-3">
                    <div className={`${action.color} rounded-lg p-2 transition-all duration-200`}>
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-gray-600">Latest email operations and status updates</p>
          </div>
          <div className="p-6">
            {stats.recentEmails.length > 0 ? (
              <div className="space-y-4">
                {stats.recentEmails.slice(0, 5).map((email: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                        <p className="text-xs text-gray-600">To: {email.recipientEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        email.status === 'sent' ? 'bg-green-100 text-green-800' :
                        email.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {email.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(email.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent emails</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by sending your first email or creating a template.
                </p>
                <div className="mt-4">
                  <Link
                    href="/admin/email/send"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Send First Email
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailManagementDashboard;