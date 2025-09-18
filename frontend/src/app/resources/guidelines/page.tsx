'use client'

import React from 'react'
import { 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'

const ResearchGuidelines = () => {
  const guidelines = [
    {
      category: "Research Ethics",
      icon: <CheckCircleIcon className="h-8 w-8 text-green-600" />,
      items: [
        "All research must adhere to ethical standards and institutional review board approval",
        "Proper consent must be obtained for human subjects research",
        "Data privacy and confidentiality must be maintained at all times",
        "Conflicts of interest must be disclosed and managed appropriately"
      ]
    },
    {
      category: "Publication Standards",
      icon: <DocumentTextIcon className="h-8 w-8 text-blue-600" />,
      items: [
        "All publications must acknowledge ORII affiliation",
        "Data and code sharing policies must be followed",
        "Open access publication is encouraged",
        "Proper citation and attribution of sources is mandatory"
      ]
    },
    {
      category: "Data Management",
      icon: <InformationCircleIcon className="h-8 w-8 text-purple-600" />,
      items: [
        "Research data must be stored securely and backed up regularly",
        "Data retention policies must be followed as per institutional guidelines",
        "Sensitive data requires additional security measures",
        "Data sharing agreements must be established for collaborative projects"
      ]
    },
    {
      category: "Safety & Compliance",
      icon: <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />,
      items: [
        "Laboratory safety protocols must be strictly followed",
        "Environmental regulations must be adhered to",
        "Equipment usage must comply with manufacturer guidelines",
        "Regular safety training and certification is required"
      ]
    }
  ]

  const procedures = [
    {
      title: "Research Proposal Submission",
      steps: [
        "Complete the ORII research proposal template",
        "Obtain necessary approvals and signatures",
        "Submit through the official research portal",
        "Await review and feedback from the research committee"
      ]
    },
    {
      title: "Ethics Review Process",
      steps: [
        "Submit ethics application with detailed methodology",
        "Provide informed consent forms and participant information",
        "Attend ethics committee meeting if required",
        "Implement any recommended modifications"
      ]
    },
    {
      title: "Progress Reporting",
      steps: [
        "Submit quarterly progress reports",
        "Include detailed financial expenditure reports",
        "Document any deviations from original proposal",
        "Schedule annual review meetings with supervisors"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Research Guidelines</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Comprehensive guidelines and standards for conducting research at the Open Research Institute of India. 
            These guidelines ensure quality, ethics, and integrity in all research activities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600 leading-relaxed">
            The Open Research Institute of India is committed to maintaining the highest standards of research 
            excellence and integrity. These guidelines provide a framework for conducting ethical, rigorous, 
            and impactful research that contributes to scientific knowledge and societal benefit.
          </p>
        </div>

        {/* Research Guidelines Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {guidelines.map((guideline, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                {guideline.icon}
                <h3 className="text-xl font-semibold text-gray-900 ml-3">{guideline.category}</h3>
              </div>
              <ul className="space-y-3">
                {guideline.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Procedures */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Procedures</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {procedures.map((procedure, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{procedure.title}</h3>
                <ol className="space-y-2">
                  {procedure.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
          <p className="text-blue-800 mb-4">
            If you have questions about these guidelines or need assistance with your research, 
            please contact our research support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="mailto:research@orii.org" 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              Contact Research Team
            </a>
            <a 
              href="/help" 
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors text-center"
            >
              Visit Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResearchGuidelines