import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '../contexts/AuthContext'
import { UserDropdown } from './UserDropdown'

export function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoading, isAuthenticated, logout } = useAuthContext()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const threshold = 120 // Don't hide header until scrolled down close to header height

      setIsVisible(currentScrollY <= threshold || currentScrollY < lastScrollY)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-[#030e2f] shadow-md z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-32'>
          <div className='flex items-center gap-4'>
            <Link to='/' className='flex items-center'>
              <img
                src='/assets/images/wizard.png'
                alt='Wizard Icon'
                className='h-24 w-24 object-contain'
              />
              <img
                src='/assets/images/litrpgacademytext.png'
                alt='LitRPG Academy'
                className='h-16 w-auto ml-2'
              />
            </Link>
          </div>
          <nav className='hidden md:flex items-center space-x-6'>
            <Link
              to='/'
              className='text-white hover:text-gray-200 transition-colors text-lg'>
              Map
            </Link>
            <Link
              to='/books'
              className='text-white hover:text-gray-200 transition-colors text-lg'>
              Explore
            </Link>
            {isLoading ? (
              <div className='text-white'>Loading...</div>
            ) : isAuthenticated && user ? (
              <>
                <Link
                  to='/my-tiers'
                  className='text-white hover:text-gray-200 transition-colors text-lg'>
                  My Tiers
                </Link>
                <Link
                  to='/community-favorites'
                  className='text-white hover:text-gray-200 transition-colors text-lg'>
                  Community Favorites
                </Link>
                <UserDropdown user={user} onLogout={logout} />
              </>
            ) : (
              <>
                <Link
                  to='/signin'
                  className='text-white hover:text-gray-200 transition-colors text-lg'>
                  Sign In
                </Link>
                <Link
                  to='/signup'
                  search={{ email: undefined, fromSignin: undefined }}
                  className='bg-white text-[#2B324B] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium'>
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className='md:hidden mobile-menu-container relative'>
            <button
              onClick={toggleMobileMenu}
              className='text-white hover:text-gray-200 p-2 transition-colors'
              aria-label='Toggle mobile menu'>
              {isMobileMenuOpen ? (
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              ) : (
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className='absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                <Link
                  to='/'
                  className='block px-4 py-3 text-[#2B324B] hover:bg-gray-50 transition-colors'
                  onClick={closeMobileMenu}>
                  Map
                </Link>
                <Link
                  to='/books'
                  className='block px-4 py-3 text-[#2B324B] hover:bg-gray-50 transition-colors'
                  onClick={closeMobileMenu}>
                  Explore
                </Link>
                {isLoading ? (
                  <div className='px-4 py-2 text-[#2B324B]'>Loading...</div>
                ) : isAuthenticated && user ? (
                  <>
                    <div className='px-4 py-2 text-sm text-gray-600 border-b border-gray-100'>
                      {user.firstName} {user.lastName}
                      <div className='text-xs text-gray-500'>{user.email}</div>
                    </div>
                    <Link
                      to='/my-tiers'
                      className='block px-4 py-3 text-[#2B324B] hover:bg-gray-50 transition-colors'
                      onClick={closeMobileMenu}>
                      My Tiers
                    </Link>
                    <Link
                      to='/community-favorites'
                      className='block px-4 py-3 text-[#2B324B] hover:bg-gray-50 transition-colors'
                      onClick={closeMobileMenu}>
                      Community Favorites
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        closeMobileMenu()
                      }}
                      className='w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100'>
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to='/signin'
                      className='block px-4 py-3 text-[#2B324B] hover:bg-gray-50 transition-colors'
                      onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                    <Link
                      to='/signup'
                      search={{ email: undefined, fromSignin: undefined }}
                      className='block mx-4 my-2 px-4 py-3 bg-[#2B324B] text-white rounded-lg hover:bg-[#1A1F2E] transition-colors text-center font-medium'
                      onClick={closeMobileMenu}>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
