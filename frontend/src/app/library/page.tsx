'use client'

import React, { useState } from 'react'
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  ClockIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const Library = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedType, setSelectedType] = useState('All')

  const categories = ['All', 'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Environmental Science', 'Social Sciences']
  const resourceTypes = ['All', 'Research Papers', 'Books', 'Journals', 'Datasets', 'Videos', 'Software']

  const featuredResources = [
    {
      title: "Artificial Intelligence: A Modern Approach",
      authors: ["Stuart Russell", "Peter Norvig"],
      type: "Book",
      category: "Computer Science",
      year: "2021",
      description: "Comprehensive textbook on artificial intelligence covering machine learning, neural networks, and expert systems.",
      rating: 4.8,
      downloads: 1250,
      available: true
    },
    {
      title: "Climate Change Research Dataset 2024",
      authors: ["Global Climate Consortium"],
      type: "Dataset",
      category: "Environmental Science",
      year: "2024",
      description: "Comprehensive climate data including temperature, precipitation, and atmospheric measurements from 1900-2024.",
      rating: 4.9,
      downloads: 892,
      available: true
    },
    {
      title: "Advanced Mathematical Methods for Engineers",
      authors: ["Maria Rodriguez", "James Chen"],
      type: "Journal",
      category: "Mathematics",
      year: "2024",
      description: "Latest research in mathematical modeling and computational methods for engineering applications.",
      rating: 4.7,
      downloads: 634,
      available: true
    }
  ]

  const recentAdditions = [
    {
      title: "Quantum Computing Fundamentals",
      type: "Video Series",
      category: "Physics",
      date: "2025-09-15",
      duration: "6 hours"
    },
    {
      title: "Machine Learning Algorithms Handbook",
      type: "Research Paper",
      category: "Computer Science",
      date: "2025-09-12",
      pages: 45
    },
    {
      title: "Sustainable Energy Systems Analysis",
      type: "Book",
      category: "Environmental Science",
      date: "2025-09-10",
      pages: 320
    },
    {
      title: "Social Network Analysis Toolkit",
      type: "Software",
      category: "Social Sciences",
      date: "2025-09-08",
      version: "2.1.0"
    }
  ]

  const digitalCollections = [
    {
      name: "IEEE Digital Library",
      description: "Access to IEEE journals, conferences, and standards",
      resources: "2.5M+ articles",
      icon: <DocumentTextIcon className="h-8 w-8 text-blue-600" />
    },
    {
      name: "ACM Digital Library",
      description: "Computer science research papers and publications",
      resources: "800K+ articles",
      icon: <ComputerDesktopIcon className="h-8 w-8 text-green-600" />
    },
    {
      name: "Research Video Archive",
      description: "Lectures, seminars, and research presentations",
      resources: "15K+ videos",
      icon: <VideoCameraIcon className="h-8 w-8 text-purple-600" />
    },
    {
      name: "Open Access Repository",
      description: "Freely available research papers and theses",
      resources: "500K+ documents",
      icon: <BookOpenIcon className="h-8 w-8 text-orange-600" />
    }
  ]

  const filteredResources = featuredResources.filter(resource => {
    const categoryMatch = selectedCategory === 'All' || resource.category === selectedCategory
    const typeMatch = selectedType === 'All' || resource.type === selectedType
    const searchMatch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       resource.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
    return categoryMatch && typeMatch && searchMatch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Digital Library</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Access a comprehensive collection of research papers, books, journals, and digital resources 
            to support your academic and research endeavors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Search Library Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Digital Collections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {digitalCollections.map((collection, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                {collection.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{collection.name}</h3>
              <p className="text-gray-600 text-sm mb-3 text-center">{collection.description}</p>
              <p className="text-indigo-600 font-medium text-sm text-center mb-4">{collection.resources}</p>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Access Collection
              </button>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Resources */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
            <div className="space-y-6">
              {filteredResources.map((resource, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 mb-2">
                        by {resource.authors.join(', ')} • {resource.year}
                      </p>
                      <p className="text-gray-700 mb-3">{resource.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      resource.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {resource.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium text-gray-900">{resource.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Category</span>
                      <p className="font-medium text-gray-900">{resource.category}</p>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium text-gray-900">{resource.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <ArrowDownTrayIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{resource.downloads}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                      View Resource
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      Download
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      Save to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Browse More */}
            <div className="mt-8 text-center">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition-colors">
                Browse All Resources
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Additions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Additions</h3>
              <div className="space-y-4">
                {recentAdditions.map((item, index) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{item.type} • {item.category}</p>
                      <p>Added: {new Date(item.date).toLocaleDateString()}</p>
                      {item.duration && <p>Duration: {item.duration}</p>}
                      {item.pages && <p>Pages: {item.pages}</p>}
                      {item.version && <p>Version: {item.version}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Library Services */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Library Services</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="text-indigo-800">24/7 Digital Access</span>
                </div>
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="text-indigo-800">Research Assistance</span>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="text-indigo-800">Citation Support</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Contact Librarian
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Resources</span>
                  <span className="font-semibold">3.8M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Digital Books</span>
                  <span className="font-semibold">125K+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Research Papers</span>
                  <span className="font-semibold">2.1M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Video Resources</span>
                  <span className="font-semibold">15K+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold">8.5K+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help Using the Library?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <BookOpenIcon className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Guides</h3>
              <p className="text-gray-600 mb-3">Step-by-step guides for using library resources</p>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                View Guides →
              </a>
            </div>
            <div className="text-center">
              <ComputerDesktopIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Tutorials</h3>
              <p className="text-gray-600 mb-3">Video tutorials on database searching and research</p>
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Watch Tutorials →
              </a>
            </div>
            <div className="text-center">
              <ClockIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Support</h3>
              <p className="text-gray-600 mb-3">Get real-time help from our librarians</p>
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                Start Chat →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library