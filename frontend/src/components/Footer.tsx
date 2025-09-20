import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Research Areas', href: '/research' },
    { name: 'Faculty', href: '/people' },
    { name: 'Events', href: '/events' },
    { name: 'Publications', href: '/research' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ]

  const researchAreas = [
    { name: 'Computer Science', href: '/research?category=Computer Science' },
    { name: 'Engineering', href: '/research?category=Engineering' },
    { name: 'Mathematics', href: '/research?category=Mathematics' },
    { name: 'Physics', href: '/research?category=Physics' },
    { name: 'Environmental Science', href: '/research?category=Environmental Science' },
    { name: 'Social Sciences', href: '/research?category=Social Sciences' },
  ]

  const resources = [
    { name: 'Research Guidelines', href: '/resources/guidelines' },
    { name: 'Funding Opportunities', href: '/resources/funding' },
    { name: 'Collaboration Portal', href: '/collaboration' },
    { name: 'Student Resources', href: '/resources/students' },
    { name: 'Library', href: '/library' },
    { name: 'Help Center', href: '/help' },
  ]

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="space-y-4">
            <div className="flex flex-col items-start space-y-2">
              <div className="flex h-14 w-14 items-center justify-center">
                <Image
                  src="/images/logos/ORII.png"
                  alt="ORII Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Advancing research and innovation through collaboration and knowledge sharing. 
              Building bridges between academia, industry, and society.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">Kanpur, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">+91 8960457971</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">+91 6296600565</span>
              </div>
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">openresearchinstituteofindia@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Research Areas</h3>
            <ul className="space-y-2">
              {researchAreas.map((area) => (
                <li key={area.name}>
                  <Link 
                    href={area.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Resources</h3>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link 
                    href={resource.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © 2025 Open Research Institute of India. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer