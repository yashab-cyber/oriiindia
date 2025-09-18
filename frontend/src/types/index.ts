export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'researcher' | 'faculty' | 'student' | 'visitor'
  profile: {
    bio?: string
    title?: string
    department?: string
    institution?: string
    researchInterests?: string[]
    avatar?: string
    website?: string
    linkedIn?: string
    orcid?: string
  }
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  fullName?: string
}

export interface ResearchPaper {
  _id: string
  title: string
  abstract: string
  authors: Array<{
    user?: string
    name: string
    affiliation?: string
    isCorresponding: boolean
  }>
  keywords: string[]
  category: string
  subcategory?: string
  status: 'draft' | 'under-review' | 'published' | 'rejected'
  publishedIn?: {
    journal?: string
    volume?: string
    issue?: string
    pages?: string
    publisher?: string
    publishedDate?: string
    doi?: string
    url?: string
  }
  files: Array<{
    name: string
    url: string
    type: 'pdf' | 'doc' | 'docx' | 'supplementary'
    size?: number
    uploadedAt: string
  }>
  citations: {
    count: number
    references: Array<{
      title: string
      authors: string
      journal: string
      year: number
      doi?: string
    }>
  }
  metrics: {
    downloads: number
    views: number
    shares: number
  }
  isOpenAccess: boolean
  isFeatured: boolean
  submittedBy: string | User
  createdAt: string
  updatedAt: string
}

export interface Event {
  _id: string
  title: string
  description: string
  shortDescription?: string
  type: 'conference' | 'workshop' | 'seminar' | 'webinar' | 'symposium' | 'lecture' | 'meeting' | 'training' | 'networking' | 'other'
  category: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  timezone: string
  venue: {
    type: 'physical' | 'virtual' | 'hybrid'
    name: string
    address?: {
      street?: string
      city?: string
      state?: string
      country?: string
      postalCode?: string
    }
    virtualLink?: string
    capacity?: number
  }
  organizers: Array<{
    user?: string
    name: string
    email?: string
    role: 'main-organizer' | 'co-organizer' | 'committee-member'
  }>
  speakers: Array<{
    user?: string
    name: string
    title?: string
    bio?: string
    avatar?: string
    topic?: string
    speakerType: 'keynote' | 'invited' | 'panel' | 'presenter'
  }>
  agenda: Array<{
    time: string
    title: string
    description?: string
    speaker?: string
    duration?: number
  }>
  registration: {
    isRequired: boolean
    deadline?: string
    fee: {
      amount: number
      currency: string
    }
    maxAttendees?: number
    registeredCount: number
  }
  tags: string[]
  images: Array<{
    url: string
    alt?: string
    isPrimary: boolean
  }>
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  isPublic: boolean
  isFeatured: boolean
  createdBy: string | User
  createdAt: string
  updatedAt: string
}

export interface Contact {
  _id: string
  name: string
  email: string
  phone?: string
  organization?: string
  subject: string
  message: string
  category: 'general-inquiry' | 'collaboration' | 'research-proposal' | 'media-inquiry' | 'technical-support' | 'partnership' | 'career-opportunity' | 'student-inquiry' | 'event-inquiry' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: string | User
  response?: {
    message: string
    respondedBy: string | User
    respondedAt: string
  }
  isSpam: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  _id: string
  title: string
  description: string
  shortDescription?: string
  category: string
  subcategory?: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeline: {
    startDate: string
    endDate: string
    milestones: Array<{
      title: string
      description?: string
      dueDate: string
      status: 'not-started' | 'in-progress' | 'completed' | 'overdue'
      completedAt?: string
    }>
  }
  team: {
    principalInvestigator: {
      user?: string
      name: string
    }
    members: Array<{
      user?: string
      name: string
      role: 'co-investigator' | 'research-associate' | 'phd-student' | 'masters-student' | 'research-assistant' | 'collaborator'
      joinDate: string
      isActive: boolean
    }>
  }
  funding?: {
    totalBudget: number
    currency: string
    sources: Array<{
      name: string
      amount: number
      type: 'government' | 'private' | 'international' | 'internal' | 'other'
      grantNumber?: string
      startDate?: string
      endDate?: string
    }>
  }
  objectives: Array<{
    description: string
    status: 'not-started' | 'in-progress' | 'completed'
  }>
  methodology?: string
  technologies: string[]
  keywords: string[]
  collaborations: Array<{
    organization: string
    type: 'academic' | 'industry' | 'government' | 'ngo' | 'international'
    contactPerson?: {
      name: string
      email: string
    }
    description?: string
  }>
  publications: string[]
  events: string[]
  progress: {
    percentage: number
    lastUpdated: string
    updates: Array<{
      title: string
      description: string
      date: string
      updatedBy: string | User
    }>
  }
  visibility: 'public' | 'internal' | 'restricted'
  isActive: boolean
  isFeatured: boolean
  createdBy: string | User
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface ApiError {
  error: {
    message: string
    status: number
    details?: Array<{
      field: string
      message: string
      value: any
    }>
  }
}