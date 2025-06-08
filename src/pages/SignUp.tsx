import { useState } from 'react';
import { requestMagicLink } from '../services/auth';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await requestMagicLink(email, firstName, lastName);
      if (response.success) {
        // Check if we're in development mode and have a verifyUrl
        if (response.verifyUrl) {
          setMessage({
            type: 'success',
            text: `Magic link created! Click here to verify: ${response.verifyUrl}`,
          });
        } else {
          setMessage({
            type: 'success',
            text: 'Welcome! Check your email for the magic link to complete your registration.',
          });
        }
        // Clear form
        setEmail('');
        setFirstName('');
        setLastName('');
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to create account',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue text-white p-8 pt-32">
      <div className="max-w-md mx-auto bg-slate p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-copper">Sign Up</h1>
        <p className="text-light-gray mb-6">Join LitRPG Academy to discover your next great read!</p>
        
        {message && (
          <div 
            className={`p-4 mb-6 rounded ${
              message.type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 rounded bg-dark-blue border border-medium-gray focus:border-copper focus:ring-1 focus:ring-copper"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded bg-copper text-dark-blue font-medium transition-colors
              ${isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-light-gray'
              }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
} 