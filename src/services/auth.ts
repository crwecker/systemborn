const AUTH_BASE_URL = '/.netlify/functions/auth';

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  token?: string;
  user?: User;
  verifyUrl?: string; // For development mode
  isExistingUser?: boolean; // Whether the user already existed
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function requestMagicLink(email: string, firstName: string, lastName: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName, lastName }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: 'Request failed',
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to request magic link',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function requestSignInLink(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        message: 'Request failed',
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to request magic link',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkUserExists(email: string): Promise<{ success: boolean; exists: boolean; error?: string }> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        exists: false,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function verifyMagicLink(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify magic link',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get the current user's information
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Logout the current user
export function logout(): void {
  localStorage.removeItem('authToken');
  window.location.href = '/';
} 