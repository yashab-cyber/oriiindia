'use client'

import React, { useState } from 'react'
import { 
  UsersIcon, 
  GlobeAltIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const CollaborationPortal = () => {
  const [selectedTab, setSelectedTab] = useState('opportunities')
  const [searchTerm, setSearchTerm] = useState('')

  const collaborationOpportunities = [
    {
      title: "AI for Climate Change Research",
      institution: "International Climate Research Consortium",
      location: "Global (Remote)",
      type: "Research Partnership",
      duration: "24 months",
      description: "Join a global network of researchers working on AI solutions for climate change mitigation and adaptation.",
      requirements: ["Machine Learning expertise", "Climate science background", "Publication record"],
      contact: "climate-ai@icrc.org",
      deadline: "2025-11-30"
    },
    {
      title: "Sustainable Energy Innovation Lab",
      institution: "European Institute of Technology",
      location: "Munich, Germany",
      type: "Exchange Program",
      duration: "6 months",
      description: "Research exchange program focusing on renewable energy technologies and smart grid systems.",
      requirements: ["PhD in Engineering", "Energy systems experience", "English proficiency"],
      contact: "exchange@eit.eu",
      deadline: "2025-12-15"
    },
    {
      title: "Digital Health Initiative",
      institution: "Stanford Medical School",
      location: "Stanford, USA",
      type: "Joint Research",
      duration: "18 months",
      description: "Collaborative research on digital health technologies and telemedicine platforms.",
      requirements: ["Healthcare informatics", "Software development", "Medical background preferred"],
      contact: "digitalhealth@stanford.edu",
      deadline: "2026-01-20"
    }
  ]

  const activeCollaborations = [
    {
      title: "Quantum Computing Research Network",
      partners: ["MIT", "Oxford University", "Tokyo Institute of Technology"],
      status: "Active",
      startDate: "2024-06-01",
      participants: 12,
      description: "Multi-institutional research on quantum algorithms and their applications."
    },
    {
      title: "Sustainable Agriculture Technology",
      partners: ["Agricultural University of India", "UC Davis", "Wageningen University"],
      status: "Active",
      startDate: "2024-03-15",
      participants: 8,
      description: "Developing IoT and AI solutions for sustainable farming practices."
    },
    {
      title: "Biomedical Engineering Consortium",
      partners: ["Johns Hopkins", "Imperial College London", "National University of Singapore"],
      status: "Active",
      startDate: "2024-01-10",
      participants: 15,
      description: "Collaborative research on medical devices and bioengineering solutions."
    }
  ]

  const researchNetworks = [
    {
      name: "Global AI Research Alliance",
      members: 45,
      focus: "Artificial Intelligence",
      established: "2023",
      description: "International network of AI researchers sharing resources and knowledge."
    },
    {
      name: "Sustainable Technology Consortium",
      members: 32,
      focus: "Environmental Technology",
      established: "2022",
      description: "Collaborative platform for sustainable technology research and development."
    },
    {
      name: "Digital Innovation Network",
      members: 28,
      focus: "Digital Transformation",
      established: "2024",
      description: "Network focusing on digital solutions for various industry challenges."
    }
  ]

  const filteredOpportunities = collaborationOpportunities.filter(opportunity =>
    opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Collaboration Portal</h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Connect with researchers worldwide, join collaborative projects, and expand your 
            research network through our global collaboration platform.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'opportunities', label: 'Opportunities', icon: GlobeAltIcon },
              { id: 'active', label: 'Active Collaborations', icon: UsersIcon },
              { id: 'networks', label: 'Research Networks', icon: ChatBubbleLeftRightIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collaboration Opportunities Tab */}
        {selectedTab === 'opportunities' && (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Post Opportunity
                </button>
              </div>
            </div>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{opportunity.title}</h3>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {opportunity.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <BuildingOffice2Icon className="h-4 w-4 mr-2" />
                      <span>{opportunity.institution}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <GlobeAltIcon className="h-4 w-4 mr-2" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AcademicCapIcon className="h-4 w-4 mr-2" />
                      <span>Duration: {opportunity.duration}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {opportunity.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Collaborations Tab */}
        {selectedTab === 'active' && (
          <div className="space-y-6">
            {activeCollaborations.map((collaboration, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{collaboration.title}</h3>
                    <p className="text-gray-600">{collaboration.description}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {collaboration.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Partners</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {collaboration.partners.map((partner, i) => (
                        <li key={i}>{partner}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Started</h4>
                    <p className="text-sm text-gray-600">{new Date(collaboration.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Participants</h4>
                    <p className="text-sm text-gray-600">{collaboration.participants} researchers</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                    View Details
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                    Join Discussion
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Research Networks Tab */}
        {selectedTab === 'networks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {researchNetworks.map((network, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{network.name}</h3>
                <p className="text-gray-600 mb-4">{network.description}</p>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Focus Area:</span>
                    <span className="font-medium">{network.focus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members:</span>
                    <span className="font-medium">{network.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Established:</span>
                    <span className="font-medium">{network.established}</span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                  Join Network
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">Start Your Collaboration Journey</h2>
          <p className="text-purple-800 mb-6">
            Ready to connect with researchers worldwide? Join our collaboration portal and 
            expand your research network today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors">
              Create Research Profile
            </button>
            <button className="border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-50 transition-colors">
              Browse All Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborationPortal