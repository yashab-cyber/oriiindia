'use client'

import React from 'react'
import { 
  ShieldCheckIcon, 
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const PrivacyPolicy = () => {
  const lastUpdated = "September 18, 2025"

  const sections = [
    {
      title: "Information We Collect",
      icon: <EyeIcon className="h-6 w-6 text-blue-600" />,
      content: [
        {
          subtitle: "Personal Information",
          details: [
            "Name, email address, and contact information when you register",
            "Academic credentials and institutional affiliations",
            "Research interests and professional background",
            "Profile information you choose to share"
          ]
        },
        {
          subtitle: "Usage Data",
          details: [
            "Pages visited and time spent on our platform",
            "Research activities and collaboration interactions",
            "Device information and IP addresses",
            "Cookies and similar tracking technologies"
          ]
        },
        {
          subtitle: "Research Data",
          details: [
            "Research papers and publications you submit",
            "Collaboration requests and communications",
            "Data uploaded for research purposes",
            "Funding applications and related documents"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <UserIcon className="h-6 w-6 text-green-600" />,
      content: [
        {
          subtitle: "Platform Services",
          details: [
            "Provide access to research resources and collaboration tools",
            "Facilitate connections between researchers and institutions",
            "Process funding applications and grant opportunities",
            "Maintain your research profile and academic credentials"
          ]
        },
        {
          subtitle: "Communication",
          details: [
            "Send important updates about your research activities",
            "Notify you of collaboration opportunities and funding",
            "Provide technical support and platform assistance",
            "Share relevant academic news and opportunities"
          ]
        },
        {
          subtitle: "Platform Improvement",
          details: [
            "Analyze usage patterns to improve our services",
            "Develop new features based on user needs",
            "Ensure platform security and prevent fraud",
            "Conduct research on academic collaboration patterns"
          ]
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <DocumentTextIcon className="h-6 w-6 text-purple-600" />,
      content: [
        {
          subtitle: "Research Collaboration",
          details: [
            "Share your research profile with potential collaborators",
            "Display your publications and research interests publicly",
            "Facilitate introductions between researchers",
            "Enable participation in collaborative projects"
          ]
        },
        {
          subtitle: "Third-Party Services",
          details: [
            "Integration with academic databases and repositories",
            "Authentication through institutional systems",
            "Cloud storage providers for research data",
            "Analytics services to improve platform performance"
          ]
        },
        {
          subtitle: "Legal Requirements",
          details: [
            "Comply with legal obligations and government requests",
            "Protect our rights and prevent fraudulent activities",
            "Enforce our terms of service and community guidelines",
            "Respond to valid legal processes and investigations"
          ]
        }
      ]
    },
    {
      title: "Data Security",
      icon: <ShieldCheckIcon className="h-6 w-6 text-red-600" />,
      content: [
        {
          subtitle: "Security Measures",
          details: [
            "Encryption of data in transit and at rest",
            "Regular security audits and vulnerability assessments",
            "Access controls and authentication mechanisms",
            "Secure backup and disaster recovery procedures"
          ]
        },
        {
          subtitle: "Data Storage",
          details: [
            "Data stored on secure, compliant cloud infrastructure",
            "Regular backups and redundancy measures",
            "Geographic distribution for reliability",
            "Compliance with international data protection standards"
          ]
        }
      ]
    },
    {
      title: "Your Rights",
      icon: <UserIcon className="h-6 w-6 text-orange-600" />,
      content: [
        {
          subtitle: "Access and Control",
          details: [
            "Access and download your personal data",
            "Correct inaccurate or incomplete information",
            "Delete your account and associated data",
            "Restrict processing of your personal information"
          ]
        },
        {
          subtitle: "Communication Preferences",
          details: [
            "Opt out of marketing communications",
            "Choose your notification preferences",
            "Control visibility of your research profile",
            "Manage collaboration and networking settings"
          ]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            We are committed to protecting your privacy and ensuring the security of your personal information. 
            This policy explains how we collect, use, and safeguard your data.
          </p>
          <div className="flex items-center mt-6 text-blue-100">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Open Research Institute of India ("ORII," "we," "us," or "our") respects your privacy and is 
            committed to protecting your personal information. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our research platform and services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using our services, you agree to the collection and use of information in accordance with this policy. 
            We will not use or share your information with anyone except as described in this Privacy Policy.
          </p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center mb-6">
              {section.icon}
              <h2 className="text-2xl font-bold text-gray-900 ml-3">{section.title}</h2>
            </div>
            
            {section.content.map((subsection, subIndex) => (
              <div key={subIndex} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subtitle}</h3>
                <ul className="space-y-2">
                  {subsection.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        {/* Cookies and Tracking */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              Cookies are small data files stored on your device that help us:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Remember your login information and preferences</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Analyze platform usage and improve our services</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Provide personalized content and recommendations</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Ensure platform security and prevent fraudulent activities</span>
              </li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences. However, disabling cookies 
              may limit some platform functionality.
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              We retain your personal information only as long as necessary to provide our services and 
              fulfill the purposes outlined in this policy:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Accounts</h3>
                <p>Information is retained while your account is active and for a reasonable period afterward.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Data</h3>
                <p>Research publications and data may be retained for academic and historical purposes.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <p>Some data may be retained longer to comply with legal obligations.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Deleted Accounts</h3>
                <p>Account deletion requests are processed within 30 days, with some exceptions for legal compliance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* International Transfers */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              As a global research platform, your information may be transferred to and processed in countries 
              other than your residence. We ensure appropriate safeguards are in place:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Compliance with applicable data protection laws</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Standard contractual clauses for international transfers</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Regular assessment of data protection adequacy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Contact Us</h2>
          <p className="text-blue-800 mb-6">
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Privacy Officer</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800">privacy@orii.org</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Open Research Institute of India<br />
                  Data Protection Department<br />
                  New Delhi, India
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Protection Rights</h3>
              <p className="text-blue-800 text-sm mb-3">
                To exercise your data protection rights or file a complaint:
              </p>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-800">rights@orii.org</span>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-100 rounded-md">
            <p className="text-blue-900 text-sm">
              <strong>Note:</strong> This Privacy Policy may be updated periodically. We will notify you of 
              any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy