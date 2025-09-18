'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dashboardAPI from '@/lib/dashboardAPI';
import { 
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  papersCount: number;
  upcomingEventsCount: number;
  collaboratorsCount: number;
  totalViews: number;
}

interface Paper {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  views?: number;
}

interface Event {
  _id: string;
  title: string;
  startDate: string;
  location: string;
  type: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    papersCount: 0,
    upcomingEventsCount: 0,
    collaboratorsCount: 0,
    totalViews: 0
  });
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setIsLoading(false);

    // Load dashboard data
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      // Load dashboard data
      const dashboardData = await dashboardAPI.getDashboardStats();

      setStats({
        papersCount: dashboardData.stats.userPapersCount || 0,
        upcomingEventsCount: dashboardData.stats.upcomingEventsCount || 0,
        totalViews: dashboardData.stats.totalViews || 0,
        collaboratorsCount: 0 // TODO: Add collaborators count
      });
      setRecentPapers((dashboardData.recentPapers || []).slice(0, 3));
      setUpcomingEvents((dashboardData.upcomingEvents || []).slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const statsDisplay = [
    {
      name: 'Research Papers',
      value: stats.papersCount.toString(),
      icon: DocumentTextIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
    },
    {
      name: 'Upcoming Events',
      value: stats.upcomingEventsCount.toString(),
      icon: CalendarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
    },
    {
      name: 'Collaborators',
      value: stats.collaboratorsCount.toString(),
      icon: UsersIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
    },
    {
      name: 'Total Views',
      value: stats.totalViews.toString(),
      icon: ChartBarIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-900/20 text-green-400 border border-green-800';
      case 'under review':
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border border-yellow-800';
      case 'draft':
        return 'bg-slate-700 text-slate-300 border border-slate-600';
      default:
        return 'bg-blue-900/20 text-blue-400 border border-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-slate-400 mt-2">
            Here&apos;s what&apos;s happening with your research and collaborations.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={loadDashboardData}
                    className="bg-red-900/30 px-3 py-2 rounded-md text-sm font-medium text-red-300 hover:bg-red-900/50 border border-red-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat) => (
            <div key={stat.name} className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} border border-slate-600`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-slate-100">
                    {dataLoading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Research Papers */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">Recent Research Papers</h2>
                <button className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add New
                </button>
              </div>
            </div>
            <div className="p-6">
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recentPapers.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No research papers yet</p>
                  <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Create your first paper
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPapers.map((paper) => (
                    <div key={paper._id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{paper.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(paper.status)}`}>
                            {paper.status}
                          </span>
                          <span className="text-sm text-slate-400">{formatDate(paper.createdAt)}</span>
                          <div className="flex items-center text-sm text-slate-400">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {paper.views || 0}
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">Upcoming Events</h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No upcoming events</p>
                  <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    Browse events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{event.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-400">{formatDate(event.startDate)}</span>
                          <span className="text-sm text-slate-400">{event.location}</span>
                          <span className="px-2 py-1 text-xs bg-blue-900/20 text-blue-400 rounded-full border border-blue-800">
                            {event.type}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/research/submit')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-center">
                <DocumentTextIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-300">Submit New Paper</span>
              </div>
            </button>
            <button 
              onClick={() => router.push('/events')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-center">
                <CalendarIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-300">Browse Events</span>
              </div>
            </button>
            <button 
              onClick={() => router.push('/people')}
              className="flex items-center justify-center p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-center">
                <UsersIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-slate-300">Find Collaborators</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}