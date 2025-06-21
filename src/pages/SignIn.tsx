import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { checkUserExists, requestSignInLink } from '../services/auth'

type ViewMode = 'form' | 'success'

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // First check if user exists
      const userCheck = await checkUserExists(email)
      if (userCheck.success) {
        if (!userCheck.exists) {
          // User doesn't exist, redirect to signup with email pre-populated
          navigate({
            to: '/signup',
            search: {
              email: email,
              fromSignin: 'true',
            },
          })
          return
        }
      } else {
        setMessage({
          type: 'error',
          text: userCheck.error || 'Failed to check user status',
        })
        setIsLoading(false)
        return
      }

      // User exists, proceed with sign in
      const response = await requestSignInLink(email)
      if (response.success) {
        // Check if we're in development mode and have a verifyUrl
        if (response.verifyUrl) {
          setSuccessMessage(
            `Magic link created! Click here to verify: ${response.verifyUrl}`
          )
        } else {
          setSuccessMessage('Magic link sent!')
        }
        setViewMode('success')
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to send magic link',
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
    setViewMode('form')
    setEmail('')
    setMessage(null)
    setSuccessMessage('')
  }

  const getTitle = () => {
    return viewMode === 'success' ? 'Check Your Email' : 'Sign In'
  }

  const getDescription = () => {
    return viewMode === 'success'
      ? 'Use the magic link to sign in.'
      : 'Welcome back! Enter your email to receive a magic link.'
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

        {viewMode === 'form' && (
          <form onSubmit={handleSubmit} className='space-y-4'>
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
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}

        {viewMode === 'success' && (
          <div className='text-center space-y-6'>
            <div className='p-6 bg-green-600/20 border border-green-600/30 rounded-lg'>
              {successMessage.includes('Click here to verify:') ? (
                <div className='text-lg'>
                  {successMessage.split('Click here to verify:')[0]}
                  <a
                    href={successMessage
                      .split('Click here to verify:')[1]
                      .trim()}
                    target='_self'
                    className='text-copper hover:text-light-gray underline ml-1'>
                    Click here to verify
                  </a>
                </div>
              ) : (
                <p className='text-lg'>{successMessage}</p>
              )}
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
