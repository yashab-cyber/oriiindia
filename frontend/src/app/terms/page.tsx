'use client'

import React from 'react'
import { 
  DocumentTextIcon, 
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const TermsOfService = () => {
  const lastUpdated = "September 18, 2025"
  const effectiveDate = "September 18, 2025"

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
      content: [
        "By accessing or using the Open Research Institute of India (ORII) platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
        "If you do not agree with any part of these terms, you may not use our services.",
        "We reserve the right to modify these terms at any time. Your continued use of the platform constitutes acceptance of any changes.",
        "These terms apply to all users, including researchers, students, faculty members, and institutional partners."
      ]
    },
    {
      title: "User Accounts and Registration",
      icon: <UserIcon className="h-6 w-6 text-blue-600" />,
      content: [
        {
          subtitle: "Account Creation",
          details: [
            "You must provide accurate, current, and complete information during registration",
            "You are responsible for maintaining the confidentiality of your account credentials",
            "You must notify us immediately of any unauthorized use of your account",
            "One person may not maintain multiple accounts without explicit permission"
          ]
        },
        {
          subtitle: "Eligibility",
          details: [
            "You must be at least 18 years old or have institutional authorization",
            "You must be affiliated with a recognized academic or research institution",
            "Commercial use requires separate agreement and approval",
            "We reserve the right to verify your credentials and institutional affiliation"
          ]
        },
        {
          subtitle: "Account Termination",
          details: [
            "You may terminate your account at any time by contacting support",
            "We may suspend or terminate accounts for violation of these terms",
            "Upon termination, your access to the platform will cease immediately",
            "Some data may be retained for legal or legitimate business purposes"
          ]
        }
      ]
    },
    {
      title: "Acceptable Use Policy",
      icon: <ShieldCheckIcon className="h-6 w-6 text-purple-600" />,
      content: [
        {
          subtitle: "Permitted Uses",
          details: [
            "Academic research and scholarly collaboration",
            "Educational activities and knowledge sharing",
            "Networking with other researchers and institutions",
            "Access to research resources and funding opportunities"
          ]
        },
        {
          subtitle: "Prohibited Activities",
          details: [
            "Violating any applicable laws or regulations",
            "Uploading malicious software or harmful content",
            "Harassing, threatening, or discriminating against other users",
            "Attempting to gain unauthorized access to system resources",
            "Commercial use without proper authorization",
            "Sharing false or misleading research information",
            "Violating intellectual property rights of others"
          ]
        }
      ]
    },
    {
      title: "Research and Content Guidelines",
      icon: <DocumentTextIcon className="h-6 w-6 text-orange-600" />,
      content: [
        {
          subtitle: "Research Ethics",
          details: [
            "All research must comply with established ethical standards",
            "Proper approval from institutional review boards is required",
            "Research involving human subjects must follow ethical guidelines",
            "Data privacy and confidentiality must be maintained"
          ]
        },
        {
          subtitle: "Content Standards",
          details: [
            "Content must be accurate, truthful, and not misleading",
            "Proper attribution and citation of sources is required",
            "Original work and appropriate permissions for shared content",
            "Content must not violate intellectual property rights"
          ]
        },
        {
          subtitle: "Data Management",
          details: [
            "Users are responsible for the accuracy of their data",
            "Sensitive data must be properly secured and classified",
            "Data sharing must comply with applicable regulations",
            "Backup and recovery of critical data is user responsibility"
          ]
        }
      ]
    },
    {
      title: "Intellectual Property Rights",
      icon: <DocumentTextIcon className="h-6 w-6 text-red-600" />,
      content: [
        {
          subtitle: "User Content",
          details: [
            "You retain ownership of content you create and upload",
            "You grant ORII a license to use, display, and distribute your content",
            "You represent that you have the right to share all uploaded content",
            "You are responsible for obtaining necessary permissions and licenses"
          ]
        },
        {
          subtitle: "Platform Content",
          details: [
            "ORII owns all rights to the platform software and design",
            "Third-party content is subject to respective owners' rights",
            "Access to content does not transfer ownership rights",
            "Fair use principles apply to academic and research purposes"
          ]
        }
      ]
    },
    {
      title: "Privacy and Data Protection",
      icon: <ShieldCheckIcon className="h-6 w-6 text-green-600" />,
      content: [
        "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.",
        "You consent to the collection and use of information as described in our Privacy Policy.",
        "We implement appropriate security measures to protect your personal information.",
        "You have rights regarding your personal data as outlined in our Privacy Policy."
      ]
    },
    {
      title: "Service Availability and Modifications",
      icon: <ClockIcon className="h-6 w-6 text-blue-600" />,
      content: [
        {
          subtitle: "Service Availability",
          details: [
            "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service",
            "Scheduled maintenance will be announced in advance when possible",
            "Emergency maintenance may occur without prior notice",
            "Service availability may vary by geographic location"
          ]
        },
        {
          subtitle: "Platform Modifications",
          details: [
            "We may modify, update, or discontinue features at any time",
            "Major changes will be communicated to users in advance",
            "New features may be subject to additional terms",
            "We are not liable for modifications that affect your use of the platform"
          ]
        }
      ]
    }
  ]

  const disclaimers = [
    {
      title: "Disclaimer of Warranties",
      content: "The platform is provided 'as is' without warranties of any kind. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components."
    },
    {
      title: "Limitation of Liability",
      content: "ORII shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform."
    },
    {
      title: "Indemnification",
      content: "You agree to indemnify and hold ORII harmless from any claims arising from your use of the platform or violation of these terms."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            These terms govern your use of the Open Research Institute of India platform. 
            Please read them carefully to understand your rights and responsibilities.
          </p>
          <div className="flex items-center mt-6 text-green-100">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Last updated: {lastUpdated} | Effective: {effectiveDate}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ORII</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Open Research Institute of India ("ORII," "we," "us," or "our") provides a platform 
            for academic research, collaboration, and knowledge sharing. These Terms of Service ("Terms") 
            govern your access to and use of our platform and services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using our platform, you enter into a legally binding agreement with ORII. These terms 
            are designed to ensure a safe, productive, and collaborative environment for all users.
          </p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center mb-6">
              {section.icon}
              <h2 className="text-2xl font-bold text-gray-900 ml-3">{section.title}</h2>
            </div>
            
            {Array.isArray(section.content) && typeof section.content[0] === 'string' ? (
              <ul className="space-y-3">
                {(section.content as string[]).map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              (section.content as Array<{subtitle: string, details: string[]}>).map((subsection, subIndex) => (
                <div key={subIndex} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{subsection.subtitle}</h3>
                  <ul className="space-y-2">
                    {subsection.details.map((detail: string, detailIndex: number) => (
                      <li key={detailIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ))}

        {/* Payment and Billing */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900 ml-3">Payment and Billing</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Services</h3>
              <p className="text-gray-700">
                Basic platform access is provided free of charge to eligible academic users. 
                This includes access to research resources, collaboration tools, and basic support.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Services</h3>
              <p className="text-gray-700 mb-2">
                Some advanced features may require payment or institutional subscription:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Premium research databases and tools</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Advanced analytics and reporting features</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Priority support and consultation services</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Additional storage and computational resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimers and Limitations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-yellow-900 ml-3">Important Legal Information</h2>
          </div>
          <div className="space-y-6">
            {disclaimers.map((disclaimer, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">{disclaimer.title}</h3>
                <p className="text-yellow-800">{disclaimer.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Governing Law</h3>
              <p className="text-gray-700">
                These Terms are governed by the laws of India. Any disputes will be subject to 
                the jurisdiction of the courts in New Delhi, India.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Alternative Dispute Resolution</h3>
              <p className="text-gray-700">
                We encourage resolving disputes through direct communication. For unresolved issues, 
                we may use mediation or arbitration as alternative dispute resolution methods.
              </p>
            </div>
          </div>
        </div>

        {/* Severability and Entire Agreement */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Provisions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Severability</h3>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable, the remaining 
                provisions will continue in full force and effect.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Entire Agreement</h3>
              <p className="text-gray-700">
                These Terms, along with our Privacy Policy, constitute the entire agreement 
                between you and ORII regarding your use of the platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment</h3>
              <p className="text-gray-700">
                You may not assign your rights under these Terms without our prior written consent. 
                ORII may assign its rights and obligations at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Contact Us</h2>
          <p className="text-green-800 mb-6">
            If you have questions about these Terms of Service, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">Legal Department</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-green-800">legal@orii.org</span>
                </div>
                <p className="text-green-800 text-sm">
                  Open Research Institute of India<br />
                  Legal and Compliance Department<br />
                  New Delhi, India
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-3">General Support</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-green-800">support@orii.org</span>
                </div>
                <p className="text-green-800 text-sm">
                  For questions about platform use,<br />
                  account issues, or general inquiries
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-100 rounded-md">
            <p className="text-green-900 text-sm">
              <strong>Important:</strong> By continuing to use the ORII platform after any modifications 
              to these Terms, you agree to be bound by the updated Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService