import { useState, useEffect, useRef } from 'react'
import type { User } from '../services/auth'

interface UserDropdownProps {
  user: User
  onLogout: () => void
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 text-[#2B324B] hover:text-[#1A1F2E] transition-colors text-lg font-medium'>
        <span>
          {user.firstName} {user.lastName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
          <div className='px-4 py-2 text-sm text-gray-600 border-b'>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'>
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}
