'use client'

import React, { useState } from 'react'
import { 
  EyeIcon, 
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const AccessibilityPage = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const lastUpdated = "September 18, 2025"

  const accessibilityFeatures = [
    {
      category: "Visual Accessibility",
      icon: <EyeIcon className="h-8 w-8 text-blue-600" />,
      features: [
        {
          title: "High Contrast Mode",
          description: "Enhanced color contrast for better visibility",
          status: "Available",
          details: "Switch to high contrast theme in user settings for improved readability."
        },
        {
          title: "Text Size Control",
          description: "Adjustable font sizes throughout the platform",
          status: "Available",
          details: "Use browser zoom or platform settings to increase text size up to 200%."
        },
        {
          title: "Color-blind Friendly",
          description: "Color schemes designed for color vision differences",
          status: "Available",
          details: "Important information is conveyed through multiple visual cues, not just color."
        },
        {
          title: "Screen Reader Support",
          description: "Compatible with JAWS, NVDA, and VoiceOver",
          status: "Available",
          details: "All content is properly labeled and structured for screen reader navigation."
        }
      ]
    },
    {
      category: "Motor Accessibility",
      icon: <CursorArrowRaysIcon className="h-8 w-8 text-green-600" />,
      features: [
        {
          title: "Keyboard Navigation",
          description: "Full platform functionality without a mouse",
          status: "Available",
          details: "Navigate using Tab, Enter, Space, and arrow keys. All interactive elements are keyboard accessible."
        },
        {
          title: "Focus Indicators",
          description: "Clear visual indicators for keyboard focus",
          status: "Available",
          details: "Prominent focus outlines help track current position during keyboard navigation."
        },
        {
          title: "Click Target Size",
          description: "Large, easy-to-target interactive elements",
          status: "Available",
          details: "Buttons and links meet minimum 44px touch target recommendations."
        },
        {
          title: "Sticky Keys Support",
          description: "Compatible with accessibility keyboard features",
          status: "Available",
          details: "Works with operating system accessibility features like sticky keys and filter keys."
        }
      ]
    },
    {
      category: "Cognitive Accessibility",
      icon: <DocumentTextIcon className="h-8 w-8 text-purple-600" />,
      features: [
        {
          title: "Clear Navigation",
          description: "Consistent and predictable interface design",
          status: "Available",
          details: "Navigation menus and page layouts remain consistent throughout the platform."
        },
        {
          title: "Plain Language",
          description: "Clear, jargon-free content where possible",
          status: "Available",
          details: "Technical terms are explained, and content is written for broad accessibility."
        },
        {
          title: "Error Prevention",
          description: "Clear error messages and validation",
          status: "Available",
          details: "Forms provide clear instructions and helpful error messages for correction."
        },
        {
          title: "Progress Indicators",
          description: "Clear feedback for multi-step processes",
          status: "Available",
          details: "Long processes show progress and provide estimated completion times."
        }
      ]
    },
    {
      category: "Auditory Accessibility",
      icon: <SpeakerWaveIcon className="h-8 w-8 text-orange-600" />,
      features: [
        {
          title: "Video Captions",
          description: "Closed captions for all video content",
          status: "In Development",
          details: "Automatic and manual captions being implemented for educational videos."
        },
        {
          title: "Audio Descriptions",
          description: "Descriptive audio for visual content",
          status: "Planned",
          details: "Audio descriptions for important visual elements in research presentations."
        },
        {
          title: "Visual Alerts",
          description: "Visual alternatives to audio notifications",
          status: "Available",
          details: "All audio alerts have corresponding visual indicators."
        },
        {
          title: "Transcript Support",
          description: "Text transcripts for audio content",
          status: "Available",
          details: "Transcripts provided for podcasts, lectures, and audio research materials."
        }
      ]
    }
  ]

  const complianceStandards = [
    {
      standard: "WCAG 2.1 AA",
      description: "Web Content Accessibility Guidelines Level AA compliance",
      status: "Compliant",
      details: "We follow WCAG 2.1 Level AA guidelines for web accessibility, ensuring broad accessibility for users with disabilities."
    },
    {
      standard: "Section 508",
      description: "US Federal accessibility requirements",
      status: "Compliant",
      details: "Platform meets Section 508 standards for accessibility in federal agencies and contractors."
    },
    {
      standard: "EN 301 549",
      description: "European accessibility standard",
      status: "Compliant",
      details: "Adheres to European accessibility requirements for ICT products and services."
    },
    {
      standard: "Rights of Persons with Disabilities Act",
      description: "Indian accessibility legislation compliance",
      status: "Compliant",
      details: "Follows Indian accessibility guidelines and disability rights requirements."
    }
  ]

  const keyboardShortcuts = [
    { keys: "Tab", action: "Navigate to next interactive element" },
    { keys: "Shift + Tab", action: "Navigate to previous interactive element" },
    { keys: "Enter", action: "Activate buttons and links" },
    { keys: "Space", action: "Select checkboxes and expand sections" },
    { keys: "Esc", action: "Close dialogs and menus" },
    { keys: "Arrow Keys", action: "Navigate within menus and lists" },
    { keys: "Ctrl + F", action: "Search within page" },
    { keys: "Alt + H", action: "Go to help section" }
  ]

  const assistiveTechnologies = [
    {
      category: "Screen Readers",
      tools: ["JAWS", "NVDA", "VoiceOver", "TalkBack", "Orca"]
    },
    {
      category: "Voice Control",
      tools: ["Dragon NaturallySpeaking", "Voice Control (macOS)", "Voice Access (Android)"]
    },
    {
      category: "Switch Navigation",
      tools: ["Switch Control", "Camera Mouse", "Head Mouse"]
    },
    {
      category: "Magnification",
      tools: ["ZoomText", "MAGic", "Built-in OS magnifiers"]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': case 'Compliant': return 'bg-green-100 text-green-800'
      case 'In Development': return 'bg-yellow-100 text-yellow-800'
      case 'Planned': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Accessibility</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            We are committed to making our research platform accessible to all users, regardless of 
            ability or technology. Learn about our accessibility features and compliance standards.
          </p>
          <div className="flex items-center mt-6 text-indigo-100">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Commitment */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Accessibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Open Research Institute of India (ORII) is committed to ensuring digital accessibility 
            for people with disabilities. We continually improve the user experience for everyone and 
            apply relevant accessibility standards to provide equal access to information and functionality.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We believe that research and knowledge should be accessible to all, and we work continuously 
            to ensure our platform meets the highest accessibility standards while maintaining 
            functionality and usability for all researchers.
          </p>
        </div>

        {/* Accessibility Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {accessibilityFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    {category.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">{category.category}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{feature.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                            {feature.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                        <p className="text-gray-500 text-xs">{feature.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Standards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{standard.standard}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(standard.status)}`}>
                    {standard.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{standard.description}</p>
                <p className="text-gray-500 text-sm">{standard.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Keyboard Shortcuts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h2>
              <p className="text-gray-600 mb-6">
                Use these keyboard shortcuts to navigate the platform efficiently without a mouse.
              </p>
              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <kbd className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-mono text-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                    <span className="text-gray-700 flex-1 ml-4">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assistive Technologies */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Assistive Technologies</h3>
              <div className="space-y-4">
                {assistiveTechnologies.map((tech, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-gray-900 mb-2">{tech.category}</h4>
                    <ul className="space-y-1">
                      {tech.tools.map((tool, toolIndex) => (
                        <li key={toolIndex} className="text-sm text-gray-600 flex items-center">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Accessibility Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <ComputerDesktopIcon className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Display Settings</h3>
              <p className="text-gray-600 mb-3">Adjust contrast, font size, and visual preferences</p>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                Customize Display →
              </button>
            </div>
            <div className="text-center">
              <CursorArrowRaysIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Settings</h3>
              <p className="text-gray-600 mb-3">Configure keyboard navigation and interaction preferences</p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Setup Navigation →
              </button>
            </div>
            <div className="text-center">
              <UserIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h3>
              <p className="text-gray-600 mb-3">Set accessibility preferences in your user profile</p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Update Profile →
              </button>
            </div>
          </div>
        </div>

        {/* Known Issues and Roadmap */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Roadmap</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">In Development</h3>
              <ul className="text-gray-600 text-sm space-y-1 mt-2">
                <li>• Enhanced screen reader support for complex data visualizations</li>
                <li>• Automatic video captioning for research presentations</li>
                <li>• Voice navigation for hands-free platform interaction</li>
              </ul>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Planned Features</h3>
              <ul className="text-gray-600 text-sm space-y-1 mt-2">
                <li>• AI-powered alternative text generation for images</li>
                <li>• Advanced personalization for cognitive accessibility</li>
                <li>• Integration with more assistive technologies</li>
                <li>• Multilingual accessibility support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feedback and Support */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">Accessibility Feedback</h2>
          <p className="text-indigo-800 mb-6">
            We welcome your feedback on the accessibility of our platform. If you encounter any 
            accessibility barriers or have suggestions for improvement, please contact us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Accessibility Team</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="text-indigo-800">accessibility@orii.org</span>
                </div>
                <p className="text-indigo-800 text-sm">
                  Open Research Institute of India<br />
                  Accessibility and Inclusion Team<br />
                  New Delhi, India
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">Response Time</h3>
              <div className="space-y-2 text-sm">
                <p className="text-indigo-800">Accessibility inquiries: <strong>24-48 hours</strong></p>
                <p className="text-indigo-800">Critical accessibility issues: <strong>Same day</strong></p>
                <p className="text-indigo-800">Feature requests: <strong>1-2 weeks</strong></p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors">
              Report Accessibility Issue
            </button>
            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition-colors">
              Request Accessibility Feature
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityPage