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

  // Get dashboard stats and combine all data
  getDashboardStats: async () => {
    console.log('📊 Starting getDashboardStats...')
    try {
      let allPapers: any[] = []
      let allEvents: any[] = []
      let currentUser: any = null

      // Test API connection first
      console.log('🔗 Testing API connection...')
      try {
        const healthCheck = await api.get('/health')
        console.log('✅ API health check passed:', healthCheck.data)
      } catch (healthError) {
        console.error('❌ API health check failed:', healthError)
      }

      // Get research papers
      console.log('📄 Fetching research papers...')
      try {
        const papersResponse = await api.get('/research')
        console.log('📄 Papers response:', papersResponse.data)
        allPapers = papersResponse.data?.data?.papers || []
        console.log(`📄 Found ${allPapers.length} papers`)
      } catch (papersError: any) {
        console.error('❌ Error fetching papers:', papersError)
        if (papersError.response) {
          console.error('📄 Papers error response:', papersError.response.data)
          console.error('📄 Papers error status:', papersError.response.status)
        }
      }

      // Get events
      console.log('📅 Fetching events...')
      try {
        const eventsResponse = await api.get('/events')
        console.log('📅 Events response:', eventsResponse.data)
        allEvents = eventsResponse.data?.data || []
        console.log(`📅 Found ${allEvents.length} events`)
      } catch (eventsError: any) {
        console.error('❌ Error fetching events:', eventsError)
        if (eventsError.response) {
          console.error('📅 Events error response:', eventsError.response.data)
          console.error('📅 Events error status:', eventsError.response.status)
        }
      }

      // Try to get current user (this might fail if endpoint doesn't exist)
      console.log('👤 Fetching current user...')
      try {
        const userResponse = await api.get('/users/profile')
        currentUser = userResponse.data?.data
        console.log('👤 Current user:', currentUser)
      } catch (userError) {
        console.warn('⚠️ Could not fetch user profile (endpoint might not exist):', (userError as any)?.message || 'Unknown error')
        // This is okay, we'll continue without user data
      }

      // Calculate statistics
      console.log('📊 Calculating statistics...')
      const now = new Date()
      const upcomingEvents = allEvents.filter((event: Event) => new Date(event.startDate) > now)
      const publishedPapers = allPapers.filter((paper: any) => paper.status === 'published')
      const draftPapers = allPapers.filter((paper: any) => paper.status === 'draft')
      
      // Calculate user-specific papers (simplified - showing all for now since we don't have user filtering)
      const userPapersCount = allPapers.length

      const totalViews = allPapers.reduce((sum: number, paper: any) => sum + (paper.metrics?.views || 0), 0)
      const totalDownloads = allPapers.reduce((sum: number, paper: any) => sum + (paper.metrics?.downloads || 0), 0)

      const stats = {
        totalPapers: allPapers.length,
        userPapersCount,
        totalEvents: allEvents.length,
        upcomingEventsCount: upcomingEvents.length,
        publishedPapers: publishedPapers.length,
        draftPapers: draftPapers.length,
        totalViews,
        totalDownloads,
      }

      console.log('📊 Final stats:', stats)

      return {
        stats,
        recentPapers: allPapers.slice(0, 5),
        upcomingEvents: upcomingEvents.slice(0, 5),
        currentUser
      }
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error)
      throw error
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
