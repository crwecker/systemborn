import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '../contexts/AuthContext'

export function Banner() {
  const { user } = useAuthContext()
  const [isWideScreen, setIsWideScreen] = useState(true)

  useEffect(() => {
    const checkScreenSize = () => {
      const threshold = 1024 // Switch to regular banner below this width
      setIsWideScreen(window.innerWidth >= threshold)
    }

    // Check initial screen size
    checkScreenSize()

    // Listen for window resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className='w-full relative flex flex-col items-center bg-dark-blue'>
      <img
        src={
          isWideScreen
            ? '/assets/images/banner-wide.png'
            : '/assets/images/banner.png'
        }
        alt='LitRPG Academy Banner'
        className='w-full h-auto object-contain'
      />
      {!user && (
        <Link
          to='/signup'
          search={{ email: undefined, fromSignin: undefined }}
          className='absolute bottom-8 px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold 
            transition-all duration-300 hover:bg-blue-600
            animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]
            hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]'>
          Start Your Journey
        </Link>
      )}
    </div>
  )
}
