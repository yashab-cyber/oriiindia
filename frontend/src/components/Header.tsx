'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import NotificationBell from './notifications/NotificationBell'
import { getApiUrl } from '@/lib/config'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Helper function to get avatar URL
  const getAvatarUrl = (avatarId: string) => {
    return getApiUrl(`/files/avatar/${avatarId}`);
  };

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Listen for localStorage changes (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setUser(updatedUser);
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      }
    };

    // Listen for avatar change events
    const handleAvatarChange = (e: CustomEvent) => {
      // Refresh user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const updatedUser = JSON.parse(storedUser);
          setUser(updatedUser);
        } catch (error) {
          console.error('Error parsing user data after avatar change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatarChanged', handleAvatarChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatarChanged', handleAvatarChange as EventListener);
    };
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Research', href: '/research' },
    { name: 'Events', href: '/events' },
    { name: 'People', href: '/people' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: UserIcon },
    { name: 'Profile Settings', href: '/profile', icon: UserIcon },
    { name: 'Upload Files', href: '/upload', icon: Cog6ToothIcon },
  ]

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl shadow-lg">
                O
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-slate-50">Orii</div>
                <div className="text-xs text-slate-300">Open Research Institute of India</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-slate-700"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side - Auth & User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 p-1">
                      <span className="sr-only">Open user menu</span>
                      {user?.profile?.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full border-2 border-slate-600"
                          src={getAvatarUrl(user.profile.avatar)}
                          alt={`${user.firstName} ${user.lastName}`}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-icon');
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center fallback-icon ${user?.profile?.avatar ? 'hidden' : ''}`}>
                        <UserIcon className="h-5 w-5 text-slate-300" />
                      </div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-slate-800 py-1 shadow-lg ring-1 ring-slate-700 focus:outline-none border border-slate-700">
                      {/* User Info */}
                      <div className="px-4 py-2 border-b border-slate-700">
                        <p className="text-sm font-medium text-slate-100">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                      </div>

                      {/* Navigation Items */}
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={`${
                                active ? 'bg-slate-700' : ''
                              } flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors`}
                            >
                              <item.icon className="mr-3 h-4 w-4" />
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}

                      {/* Collaborations */}
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/collaborations"
                            className={`${
                              active ? 'bg-slate-700' : ''
                            } flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors`}
                          >
                            <UserIcon className="mr-3 h-4 w-4" />
                            Collaborations
                          </Link>
                        )}
                      </Menu.Item>

                      {/* Logout */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-slate-700' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 shadow-lg bg-slate-800 border-t border-slate-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="flex items-center px-3">
                      <div className="flex-shrink-0">
                        {user?.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full border-2 border-slate-600"
                            src={user.profilePicture}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-slate-100">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm font-medium text-slate-400">{user?.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      ))}
                      <Link
                        href="/collaborations"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Collaborations
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  )
}

export default Header
