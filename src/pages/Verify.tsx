import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { verifyMagicLink } from '../services/auth'
import { useAuthContext } from '../contexts/AuthContext'

export function Verify() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying'
  )
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { token?: string }
  const { refreshAuth } = useAuthContext()
  const hasVerified = useRef(false)

  useEffect(() => {
    const token = search.token
    if (!token) {
      setStatus('error')
      setError('No verification token found')
      return
    }

    // Prevent multiple verification attempts
    if (hasVerified.current) {
      return
    }

    const verifyToken = async () => {
      try {
        hasVerified.current = true
        console.log('Starting verification for token:', token)

        const response = await verifyMagicLink(token)
        console.log('Verification response:', response)

        if (response.success && response.token) {
          // Store the auth token
          localStorage.setItem('authToken', response.token)
          console.log('Auth token stored, setting success status')
          setStatus('success')

          // Refresh auth state to immediately update the header
          console.log('Refreshing auth state')
          await refreshAuth()

          // Redirect after a short delay
          setTimeout(() => {
            console.log('Redirecting to home')
            navigate({ to: '/' })
          }, 1500)
        } else {
          console.log('Verification failed:', response.error)
          setStatus('error')
          setError(response.error || 'Verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setError('An unexpected error occurred')
      }
    }

    verifyToken()
  }, [search.token, navigate, refreshAuth])

  return (
    <div className='min-h-screen bg-dark-blue text-white p-8'>
      <div className='max-w-md mx-auto bg-slate p-8 rounded-lg shadow-lg text-center'>
        {status === 'verifying' && (
          <>
            <h1 className='text-3xl font-bold mb-4 text-copper'>
              Verifying...
            </h1>
            <p className='text-light-gray'>
              Please wait while we verify your magic link.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className='text-3xl font-bold mb-4 text-copper'>Success!</h1>
            <p className='text-light-gray'>
              You have been successfully signed in.
            </p>
            <p className='text-light-gray mt-2'>
              Redirecting you to the homepage...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className='text-3xl font-bold mb-4 text-copper'>
              Verification Failed
            </h1>
            <p className='text-red-500 mb-4'>{error}</p>
            <Link
              to='/signin'
              className='bg-copper text-dark-blue px-6 py-2 rounded hover:bg-light-gray transition-colors'>
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
