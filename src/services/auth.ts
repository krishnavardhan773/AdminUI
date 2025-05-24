import { User } from '../types';

const SESSION_KEY = 'blog_admin_session';

// Session management
export const setSession = (sessionId: string) => {
  localStorage.setItem(SESSION_KEY, sessionId);
};

export const getSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Auth checks
export const isAuthenticated = (): boolean => {
  return !!getSession();
};

export const getCurrentUser = (): Partial<User> | null => {
  const session = getSession();
  return session ? { username: session } : null;
};

// Login function
export const login = async (username: string, password: string): Promise<void> => {
  // First get the CSRF token
  const tokenResponse = await fetch('https://stocai-blog-backend.onrender.com/admin/login/', {
    method: 'GET',
    credentials: 'include',
  });
  
  const html = await tokenResponse.text();
  const csrfMatch = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';
  
  if (!csrfToken) {
    throw new Error('Could not get CSRF token');
  }

  // Now perform the login
  const loginResponse = await fetch('https://stocai-blog-backend.onrender.com/admin/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken,
    },
    body: new URLSearchParams({
      csrfmiddlewaretoken: csrfToken,
      username,
      password,
      next: '/admin/',
    }),
    credentials: 'include',
  });

  if (!loginResponse.ok) {
    throw new Error('Login failed. Please check your credentials.');
  }

  // If login successful, store the username
  setSession(username);
};

// Logout function
export const logout = async () => {
  try {
    await fetch('https://stocai-blog-backend.onrender.com/admin/logout/', {
      method: 'GET',
      credentials: 'include',
    });
  } finally {
    clearSession();
    window.location.href = '/login';
  }
};