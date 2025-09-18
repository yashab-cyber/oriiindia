'use client'

import React, { useState } from 'react'
import { 
  CurrencyDollarIcon, 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const FundingOpportunities = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const categories = ['All', 'Government', 'Private Foundation', 'International', 'Industry Partnership', 'Internal']
  const statuses = ['All', 'Open', 'Closing Soon', 'Upcoming']

  const fundingOpportunities = [
    {
      title: "National Science Foundation Research Grant",
      organization: "Government of India",
      amount: "₹50,00,000 - ₹2,00,00,000",
      deadline: "2025-12-15",
      category: "Government",
      status: "Open",
      description: "Support for fundamental research in science and engineering disciplines.",
      eligibility: ["Faculty members", "PhD holders", "Research scholars"],
      applicationUrl: "#"
    },
    {
      title: "Tech Innovation Fellowship",
      organization: "TechCorp Foundation",
      amount: "₹25,00,000",
      deadline: "2025-10-30",
      category: "Private Foundation",
      status: "Closing Soon",
      description: "Fellowship for innovative technology research with commercial potential.",
      eligibility: ["Early-career researchers", "Startup founders", "PhD students"],
      applicationUrl: "#"
    },
    {
      title: "International Collaboration Research Grant",
      organization: "Indo-Global Research Council",
      amount: "₹75,00,000",
      deadline: "2026-01-20",
      category: "International",
      status: "Upcoming",
      description: "Funding for collaborative research projects with international partners.",
      eligibility: ["Senior researchers", "Research institutes", "University partnerships"],
      applicationUrl: "#"
    },
    {
      title: "Green Energy Research Initiative",
      organization: "Ministry of New and Renewable Energy",
      amount: "₹1,00,00,000",
      deadline: "2025-11-15",
      category: "Government",
      status: "Open",
      description: "Research grants for sustainable energy solutions and environmental impact studies.",
      eligibility: ["Environmental researchers", "Energy specialists", "Climate scientists"],
      applicationUrl: "#"
    },
    {
      title: "AI & Machine Learning Research Fund",
      organization: "AI Research Consortium",
      amount: "₹40,00,000",
      deadline: "2025-12-01",
      category: "Industry Partnership",
      status: "Open",
      description: "Industry-sponsored research in artificial intelligence and machine learning applications.",
      eligibility: ["Computer science researchers", "Data scientists", "AI specialists"],
      applicationUrl: "#"
    },
    {
      title: "ORII Internal Research Seed Grant",
      organization: "Open Research Institute of India",
      amount: "₹5,00,000",
      deadline: "2025-10-15",
      category: "Internal",
      status: "Closing Soon",
      description: "Internal funding for pilot projects and preliminary research initiatives.",
      eligibility: ["ORII faculty", "Research associates", "Visiting researchers"],
      applicationUrl: "#"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800'
      case 'Closing Soon': return 'bg-red-100 text-red-800'
      case 'Upcoming': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredOpportunities = fundingOpportunities.filter(opportunity => {
    const categoryMatch = selectedCategory === 'All' || opportunity.category === selectedCategory
    const statusMatch = selectedStatus === 'All' || opportunity.status === selectedStatus
    return categoryMatch && statusMatch
  })

  const fundingTips = [
    "Start preparing your application at least 2 months before the deadline",
    "Ensure your research aligns with the funding organization's priorities",
    "Include a detailed budget breakdown with justifications",
    "Obtain letters of support from collaborators and institutions",
    "Review successful proposals from previous years if available"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Funding Opportunities</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Discover research funding opportunities from government agencies, private foundations, 
            and industry partners to support your research initiatives.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Opportunities</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Funding Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredOpportunities.map((opportunity, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">{opportunity.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{opportunity.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>{opportunity.organization}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">{opportunity.amount}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                    <span className="ml-2 text-orange-600">
                      ({getDaysRemaining(opportunity.deadline)} days remaining)
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {opportunity.eligibility.map((criterion, i) => (
                      <li key={i}>{criterion}</li>
                    ))}
                  </ul>
                </div>

                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Application Tips */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
              <ul className="space-y-3">
                {fundingTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Need Assistance?</h3>
              <p className="text-green-800 mb-4">
                Our research support team can help you identify suitable funding opportunities 
                and provide guidance on application preparation.
              </p>
              <a 
                href="mailto:funding@orii.org" 
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-block"
              >
                Contact Funding Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FundingOpportunities