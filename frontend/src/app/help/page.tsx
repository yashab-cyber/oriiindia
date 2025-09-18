'use client'

import React, { useState } from 'react'
import { 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const categories = ['All', 'Account', 'Research', 'Technical', 'Library', 'Collaboration', 'Funding']

  const faqData = [
    {
      question: "How do I create a research account?",
      answer: "To create a research account, visit the registration page and fill out the required information. You'll need to provide your academic credentials and research interests. After submitting, your account will be reviewed and activated within 24-48 hours.",
      category: "Account"
    },
    {
      question: "How can I access the digital library?",
      answer: "Once logged in, navigate to the Library section from the main menu. You can search for resources by title, author, or keyword. Most resources are freely accessible to registered users, while some premium content may require additional permissions.",
      category: "Library"
    },
    {
      question: "What are the research guidelines I need to follow?",
      answer: "All research conducted at ORII must adhere to our comprehensive research guidelines, which include ethics approval, data management protocols, and publication standards. You can find the complete guidelines in the Resources section.",
      category: "Research"
    },
    {
      question: "How do I apply for research funding?",
      answer: "Visit the Funding Opportunities page to browse available grants and scholarships. Each opportunity has specific eligibility criteria and application procedures. Our funding team can provide guidance on preparing competitive applications.",
      category: "Funding"
    },
    {
      question: "I'm having trouble accessing my account",
      answer: "If you're experiencing login issues, first try resetting your password using the 'Forgot Password' link. If the problem persists, check that your account is activated and contact our technical support team for assistance.",
      category: "Technical"
    },
    {
      question: "How can I find research collaborators?",
      answer: "Use our Collaboration Portal to browse research opportunities, active projects, and researcher profiles. You can search by research area, institution, or specific skills. You can also post your own collaboration opportunities.",
      category: "Collaboration"
    },
    {
      question: "What student support services are available?",
      answer: "ORII offers comprehensive student support including academic guidance, mental health resources, career counseling, and financial aid. Visit the Student Resources page or contact our student support team directly.",
      category: "Account"
    },
    {
      question: "How do I report a technical issue?",
      answer: "You can report technical issues through our support ticket system, live chat, or by emailing tech-support@orii.org. Please include details about the issue, your browser, and any error messages you encountered.",
      category: "Technical"
    }
  ]

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "Mon-Fri, 9 AM - 6 PM IST",
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />,
      action: "Start Chat"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions via email",
      availability: "Response within 24 hours",
      icon: <EnvelopeIcon className="h-8 w-8 text-green-600" />,
      action: "Send Email"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team",
      availability: "Mon-Fri, 10 AM - 5 PM IST",
      icon: <PhoneIcon className="h-8 w-8 text-purple-600" />,
      action: "Call Now"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides and tutorials",
      availability: "Available 24/7",
      icon: <VideoCameraIcon className="h-8 w-8 text-orange-600" />,
      action: "Watch Videos"
    }
  ]

  const quickLinks = [
    { title: "User Guide", description: "Complete guide to using ORII platform", link: "#" },
    { title: "Research Guidelines", description: "Policies and procedures for research", link: "/resources/guidelines" },
    { title: "Technical Documentation", description: "API docs and technical resources", link: "#" },
    { title: "Video Tutorials", description: "Step-by-step video guides", link: "#" },
    { title: "System Status", description: "Check current system status", link: "#" },
    { title: "Contact Directory", description: "Find the right person to contact", link: "#" }
  ]

  const filteredFaq = faqData.filter(faq => {
    const categoryMatch = selectedCategory === 'All' || faq.category === selectedCategory
    const searchMatch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && searchMatch
  })

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Get the support you need to make the most of your research experience at ORII. 
            Find answers, tutorials, and connect with our support team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center mb-6">
            <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
            <p className="text-gray-600">Search our knowledge base for instant answers</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ask a question or search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center mb-4">
                {channel.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
              <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                <ClockIcon className="h-3 w-3 mr-1" />
                {channel.availability}
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                {channel.action}
              </button>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="mb-4">
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

            <div className="space-y-4">
              {filteredFaq.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs mt-2">
                          {faq.category}
                        </span>
                      </div>
                      {expandedFaq === index ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                {quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.link}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{link.title}</h4>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Contact Support</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">support@orii.org</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">+91-11-XXXX-HELP</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">Mon-Fri, 9 AM - 6 PM IST</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Contact Support Team
              </button>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Emergency Support</h3>
              <p className="text-red-800 text-sm mb-3">
                For urgent technical issues or security concerns
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-red-800">Emergency Hotline: <strong>+91-11-XXXX-911</strong></p>
                <p className="text-red-800">Security Issues: <strong>security@orii.org</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Help Us Improve</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Let us know how we can improve our help resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Submit Feedback
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
              Request New Feature
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter