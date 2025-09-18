import api from './api'
import { Event, ResearchPaper } from '../types'

// Dashboard API functions
export const dashboardAPI = {
  // Get all research papers (since there's no user-specific endpoint yet)
  getResearchPapers: async () => {
    try {
      const response = await api.get('/research')
      return response.data
    } catch (error) {
      console.error('Error fetching research papers:', error)
      throw new Error('Failed to fetch research papers')
    }
  },

  // Get all events
  getEvents: async () => {
    try {
      const response = await api.get('/events')
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw new Error('Failed to fetch events')
    }
  },

  // Get current user info from localStorage (since no /me endpoint exists)
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // Get research papers and events
      const [papersResponse, eventsResponse] = await Promise.all([
        api.get('/research'),
        api.get('/events')
      ])

      const papers = papersResponse.data?.data || []
      const events = eventsResponse.data?.data || []
      
      // Filter upcoming events
      const upcomingEvents = events.filter((event: Event) => new Date(event.startDate) > new Date())
      
      // Get current user to filter user-specific data
      const currentUser = dashboardAPI.getCurrentUser()
      const userId = currentUser?._id || currentUser?.id
      
      // Filter user's papers (if user ID available)
      const userPapers = userId 
        ? papers.filter((paper: any) => 
            paper.submittedBy === userId || 
            paper.submittedBy?._id === userId ||
            paper.authors?.some((author: any) => author.user === userId)
          )
        : papers

      // Calculate statistics
      const stats = {
        totalPapers: papers.length,
        userPapersCount: userPapers.length,
        totalEvents: events.length,
        upcomingEventsCount: upcomingEvents.length,
        publishedPapers: userPapers.filter((paper: any) => paper.status === 'published').length,
        draftPapers: userPapers.filter((paper: any) => paper.status === 'draft').length,
        totalViews: userPapers.reduce((sum: number, paper: any) => sum + (paper.metrics?.views || 0), 0),
        totalDownloads: userPapers.reduce((sum: number, paper: any) => sum + (paper.metrics?.downloads || 0), 0)
      }

      return {
        stats,
        recentPapers: userPapers.slice(0, 5), // Last 5 papers
        upcomingEvents: upcomingEvents.slice(0, 3), // Next 3 events
        currentUser
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw new Error('Failed to load dashboard data')
    }
  },

  // Get user's recent activity (simplified version)
  getRecentActivity: async () => {
    try {
      const currentUser = dashboardAPI.getCurrentUser()
      const userId = currentUser?._id || currentUser?.id

      if (!userId) {
        return []
      }

      // Get recent papers
      const papersResponse = await api.get('/research')
      const papers = papersResponse.data?.data || []
      
      const userPapers = papers.filter((paper: any) => 
        paper.submittedBy === userId || 
        paper.submittedBy?._id === userId ||
        paper.authors?.some((author: any) => author.user === userId)
      )

      // Create activity items from recent papers
      const activities = userPapers
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
        .map((paper: any) => ({
          id: paper._id,
          type: 'paper',
          title: `${paper.status === 'published' ? 'Published' : 'Updated'} paper: ${paper.title}`,
          date: paper.updatedAt,
          status: paper.status
        }))

      return activities
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }
}

export default dashboardAPI
