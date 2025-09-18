'use client'

import React, { useState } from 'react'
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const StudentResources = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', 'Academic Support', 'Research Tools', 'Career Development', 'Student Life', 'Financial Aid']

  const resources = [
    {
      title: "Research Methodology Workshop",
      category: "Academic Support",
      type: "Workshop",
      description: "Learn fundamental research methods and data analysis techniques.",
      duration: "4 weeks",
      level: "Beginner",
      availability: "Available",
      link: "#"
    },
    {
      title: "Academic Writing Guide",
      category: "Academic Support",
      type: "Guide",
      description: "Comprehensive guide to academic writing, citation styles, and publication standards.",
      duration: "Self-paced",
      level: "All levels",
      availability: "Available",
      link: "#"
    },
    {
      title: "Statistical Analysis Software Training",
      category: "Research Tools",
      type: "Training",
      description: "Hands-on training for SPSS, R, and Python for statistical analysis.",
      duration: "6 weeks",
      level: "Intermediate",
      availability: "Available",
      link: "#"
    },
    {
      title: "Career Planning & Development",
      category: "Career Development",
      type: "Program",
      description: "Career guidance, resume building, and interview preparation for research careers.",
      duration: "3 months",
      level: "All levels",
      availability: "Available",
      link: "#"
    },
    {
      title: "Student Mental Health Support",
      category: "Student Life",
      type: "Service",
      description: "Counseling services and mental health resources for students.",
      duration: "Ongoing",
      level: "All levels",
      availability: "Available",
      link: "#"
    },
    {
      title: "Research Scholarship Program",
      category: "Financial Aid",
      type: "Scholarship",
      description: "Merit-based scholarships for outstanding research students.",
      duration: "Annual",
      level: "Graduate",
      availability: "Open Applications",
      link: "#"
    }
  ]

  const quickLinks = [
    {
      title: "Student Portal",
      description: "Access your academic records, course materials, and announcements",
      icon: <ComputerDesktopIcon className="h-8 w-8 text-blue-600" />,
      link: "#"
    },
    {
      title: "Academic Calendar",
      description: "Important dates, deadlines, and academic schedules",
      icon: <ClockIcon className="h-8 w-8 text-green-600" />,
      link: "#"
    },
    {
      title: "Research Guidelines",
      description: "Guidelines and policies for student research projects",
      icon: <DocumentTextIcon className="h-8 w-8 text-purple-600" />,
      link: "/resources/guidelines"
    },
    {
      title: "Student Organizations",
      description: "Join student groups, clubs, and professional organizations",
      icon: <UserGroupIcon className="h-8 w-8 text-orange-600" />,
      link: "#"
    }
  ]

  const upcomingEvents = [
    {
      title: "Graduate Research Symposium",
      date: "2025-10-15",
      time: "9:00 AM",
      location: "Main Auditorium",
      type: "Conference"
    },
    {
      title: "Career Fair 2025",
      date: "2025-10-22",
      time: "10:00 AM",
      location: "Campus Center",
      type: "Career Event"
    },
    {
      title: "Research Ethics Workshop",
      date: "2025-10-28",
      time: "2:00 PM",
      location: "Virtual",
      type: "Workshop"
    }
  ]

  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'All' || resource.category === selectedCategory
    const searchMatch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && searchMatch
  })

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Open Applications': return 'bg-blue-100 text-blue-800'
      case 'Limited': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Student Resources</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Comprehensive resources and support services to help students succeed in their 
            academic journey and research endeavors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link, index) => (
            <a 
              key={index}
              href={link.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-3">
                {link.icon}
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{link.title}</h3>
              <p className="text-gray-600 text-sm">{link.description}</p>
            </a>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resources Section */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="space-y-6">
              {filteredResources.map((resource, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-3">{resource.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(resource.availability)}`}>
                      {resource.availability}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Category</span>
                      <p className="font-medium text-gray-900">{resource.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium text-gray-900">{resource.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Duration</span>
                      <p className="font-medium text-gray-900">{resource.duration}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Level</span>
                      <p className="font-medium text-gray-900">{resource.level}</p>
                    </div>
                  </div>

                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Access Resource
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                      <p>{event.location}</p>
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                View All Events
              </button>
            </div>

            {/* Student Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Support?</h3>
              <p className="text-blue-800 mb-4">
                Our student support team is here to help you with academic, personal, and career guidance.
              </p>
              <div className="space-y-3">
                <a 
                  href="mailto:students@orii.org" 
                  className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  Contact Support
                </a>
                <a 
                  href="#" 
                  className="block border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-center"
                >
                  Schedule Meeting
                </a>
              </div>
            </div>

            {/* Emergency Resources */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Emergency Resources</h3>
              <div className="space-y-2 text-sm">
                <p className="text-red-800">Campus Security: <strong>+91-11-XXXX-1234</strong></p>
                <p className="text-red-800">Health Center: <strong>+91-11-XXXX-5678</strong></p>
                <p className="text-red-800">Crisis Helpline: <strong>+91-11-XXXX-9999</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <BookOpenIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Library</h3>
              <p className="text-gray-600 mb-3">Access research papers, journals, and academic databases</p>
              <a href="/library" className="text-blue-600 hover:text-blue-700 font-medium">
                Visit Library →
              </a>
            </div>
            <div className="text-center">
              <AcademicCapIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Development</h3>
              <p className="text-gray-600 mb-3">Online courses and workshops to enhance your skills</p>
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Explore Courses →
              </a>
            </div>
            <div className="text-center">
              <UserGroupIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Peer Network</h3>
              <p className="text-gray-600 mb-3">Connect with fellow students and alumni</p>
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                Join Network →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentResources