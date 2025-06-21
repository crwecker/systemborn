import { useState } from 'react'
import {
  checkUserExists,
  requestMagicLink,
  requestSignInLink,
} from '../services/auth'

type AuthMode = 'initial' | 'signup' | 'success'

export function SmartAuth() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mode, setMode] = useState<AuthMode>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await checkUserExists(email)
      if (result.success) {
        if (result.exists) {
          // User exists, automatically send magic link for sign in
          const response = await requestSignInLink(email)
          if (response.success) {
            // Check if we're in development mode and have a verifyUrl
            if (response.verifyUrl) {
              setSuccessMessage(
                `Magic link created! Click here to verify: ${response.verifyUrl}`
              )
            } else {
              setSuccessMessage('Check your email for the magic link!')
            }
            setMode('success')
          } else {
            setMessage({
              type: 'error',
              text: response.error || 'Failed to send magic link',
            })
          }
        } else {
          // User doesn't exist, switch to sign up mode
          setMode('signup')
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to check user status',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (!firstName || !lastName) {
        setMessage({
          type: 'error',
          text: 'First name and last name are required for sign up',
        })
        setIsLoading(false)
        return
      }

      const response = await requestMagicLink(email, firstName, lastName)

      if (response.success) {
        // Check if we're in development mode and have a verifyUrl
        if (response.verifyUrl) {
          setSuccessMessage(
            `Magic link created! Click here to verify: ${response.verifyUrl}`
          )
        } else {
          setSuccessMessage(
            'Welcome! Check your email for the magic link to complete your registration.'
          )
        }
        setMode('success')
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to create account',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = () => {
    setMode('initial')
    setEmail('')
    setFirstName('')
    setLastName('')
    setMessage(null)
    setSuccessMessage('')
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        return 'Create Your Account'
      case 'success':
        return 'Check Your Email'
      default:
        return 'Join LitRPG Academy'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'signup':
        return 'Complete your sign up to discover your next great read!'
      case 'success':
        return "We've sent you a magic link to sign in."
      default:
        return 'Enter your email to sign in or to create an account.'
    }
  }

  return (
    <div className='min-h-screen bg-dark-blue text-white p-8'>
      <div className='max-w-md mx-auto bg-slate p-8 rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold mb-6 text-copper'>{getTitle()}</h1>
        <p className='text-light-gray mb-6'>{getDescription()}</p>

        {message && (
          <div
            className={`p-4 mb-6 rounded ${
              message.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}>
            {message.text}
          </div>
        )}

        {mode === 'initial' && (
          <form onSubmit={handleEmailSubmit} className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium mb-1'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper'
                autoFocus
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded bg-copper text-dark-blue font-medium transition-colors
                ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-light-gray'
                }`}>
              {isLoading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleAuthSubmit} className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium mb-1'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper'
                required
                disabled
              />
            </div>

            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-medium mb-1'>
                First Name
              </label>
              <input
                type='text'
                id='firstName'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className='w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper'
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor='lastName'
                className='block text-sm font-medium mb-1'>
                Last Name
              </label>
              <input
                type='text'
                id='lastName'
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className='w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper'
                required
              />
            </div>

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleStartOver}
                className='px-4 py-2 rounded border border-medium-gray text-light-gray hover:bg-medium-gray transition-colors'>
                Change Email
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded bg-copper text-dark-blue font-medium transition-colors
                  ${
                    isLoading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-light-gray'
                  }`}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {mode === 'success' && (
          <div className='text-center space-y-6'>
            <div className='p-6 bg-green-600/20 border border-green-600/30 rounded-lg'>
              <p className='text-lg'>{successMessage}</p>
            </div>

            <p className='text-light-gray'>
              Didn't receive the email? Check your spam folder or try again with
              a different email address.
            </p>

            <button
              onClick={handleStartOver}
              className='w-full py-2 px-4 rounded border border-medium-gray text-light-gray hover:bg-medium-gray transition-colors'>
              Use Different Email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
