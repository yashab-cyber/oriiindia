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
    
    // Check if we have a token
    const token = localStorage.getItem('token')
    console.log('🔑 Token exists:', !!token)
    
    try {
      let allPapers: any[] = []
      let allEvents: any[] = []
      let currentUser: any = null

      // Test API connection first
      console.log('🔗 Testing API connection...')
      try {
        const healthCheck = await api.get('/health')
        console.log('✅ API health check passed:', healthCheck.data)
      } catch (healthError: any) {
        console.error('❌ API health check failed:', healthError)
        console.error('❌ Health check error details:', healthError.response?.data)
      }

      // Get research papers (this should work without auth)
      console.log('📄 Fetching research papers...')
      try {
        const papersResponse = await api.get('/research', {
          timeout: 10000 // 10 second timeout
        })
        console.log('📄 Papers response status:', papersResponse.status)
        console.log('📄 Papers response:', papersResponse.data)
        allPapers = papersResponse.data?.data?.papers || []
        console.log(`📄 Found ${allPapers.length} papers`)
      } catch (papersError: any) {
        console.error('❌ Error fetching papers:', papersError)
        console.error('📄 Papers error message:', papersError.message)
        if (papersError.response) {
          console.error('📄 Papers error response:', papersError.response.data)
          console.error('📄 Papers error status:', papersError.response.status)
        }
        if (papersError.code === 'NETWORK_ERROR') {
          console.error('📄 Network error - check CORS and API URL')
        }
      }

      // Get events (this should work without auth)
      console.log('📅 Fetching events...')
      try {
        const eventsResponse = await api.get('/events', {
          timeout: 10000 // 10 second timeout
        })
        console.log('📅 Events response status:', eventsResponse.status)
        console.log('📅 Events response:', eventsResponse.data)
        allEvents = eventsResponse.data?.data || []
        console.log(`📅 Found ${allEvents.length} events`)
      } catch (eventsError: any) {
        console.error('❌ Error fetching events:', eventsError)
        console.error('📅 Events error message:', eventsError.message)
        if (eventsError.response) {
          console.error('📅 Events error response:', eventsError.response.data)
          console.error('📅 Events error status:', eventsError.response.status)
        }
        if (eventsError.code === 'NETWORK_ERROR') {
          console.error('📅 Network error - check CORS and API URL')
        }
      }

      // Try to get current user (this might require auth)
      console.log('👤 Fetching current user...')
      try {
        const userResponse = await api.get('/users/profile')
        currentUser = userResponse.data?.data
        console.log('👤 Current user:', currentUser)
      } catch (userError: any) {
        console.warn('⚠️ Could not fetch user profile:', userError?.message || 'Unknown error')
        console.warn('⚠️ This might be normal if the endpoint requires auth or doesn\'t exist')
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

      // Ensure we return valid data even if some API calls failed
      const result = {
        stats,
        recentPapers: allPapers.slice(0, 5),
        upcomingEvents: upcomingEvents.slice(0, 5),
        currentUser
      }

      console.log('📊 Returning dashboard data:', result)
      return result
    } catch (error: any) {
      console.error('❌ Critical error in getDashboardStats:', error)
      console.error('❌ Error details:', error.message)
      console.error('❌ Error stack:', error.stack)
      
      // Return default data instead of throwing error
      const fallbackData = {
        stats: {
          totalPapers: 0,
          userPapersCount: 0,
          totalEvents: 0,
          upcomingEventsCount: 0,
          publishedPapers: 0,
          draftPapers: 0,
          totalViews: 0,
          totalDownloads: 0,
        },
        recentPapers: [],
        upcomingEvents: [],
        currentUser: null
      }
      
      console.log('📊 Returning fallback data due to error')
      return fallbackData
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
