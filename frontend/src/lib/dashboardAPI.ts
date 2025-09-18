import api from './api'

// Dashboard API functions
export const dashboardAPI = {
  // Get user's research papers
  getUserPapers: async () => {
    try {
      const response = await api.get('/papers/user/my-papers')
      return response.data
    } catch (error) {
      console.error('Error fetching user papers:', error)
      throw error
    }
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/events', {
        params: {
          limit: 5,
          sort: 'startDate',
          order: 'asc'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      // Get user papers count
      const papersResponse = await api.get('/papers/user/my-papers')
      const papers = papersResponse.data?.data || []
      
      // Get collaborations stats
      const collabResponse = await api.get('/collaborations/stats/overview')
      const collabStats = collabResponse.data?.data || {}
      
      // Get events count (upcoming only)
      const eventsResponse = await api.get('/events', {
        params: {
          limit: 100,
          sort: 'startDate',
          order: 'asc'
        }
      })
      const events = eventsResponse.data?.data || []
      const upcomingEvents = events.filter(event => new Date(event.startDate) > new Date())
      
      // Calculate total views/citations from papers
      const totalViews = papers.reduce((sum: number, paper: any) => sum + (paper.views || 0), 0)
      
      return {
        papersCount: papers.length,
        upcomingEventsCount: upcomingEvents.length,
        collaboratorsCount: collabStats.totalCollaborators || 0,
        totalViews: totalViews
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  },

  // Get user notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications', {
        params: {
          limit: 5
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }
}

export default dashboardAPI