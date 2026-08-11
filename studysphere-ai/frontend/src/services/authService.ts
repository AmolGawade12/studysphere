import { apiRequest } from './api';

export const authService = {
  login: async (credentials: { username?: string; email?: string; password?: string }) => {
    const data = await apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data && data.token) {
      localStorage.setItem('ss_token', data.token);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return data.user;
  },

  register: async (details: { username?: string; email: string; password: string; name: string; college: string; course: string; year: string }) => {
    // Generate valid username from email if not explicitly provided
    const effectiveUsername = (details.username && details.username.trim()) 
      ? details.username.trim() 
      : details.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    const payload = {
      username: effectiveUsername,
      email: details.email.trim(),
      password: details.password,
      profile: {
        name: details.name.trim(),
        email: details.email.trim(),
        college: details.college.trim(),
        course: details.course.trim(),
        year: details.year
      }
    };

    console.log("[authService.register] Sending payload to Django REST API:", payload);

    const data = await apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log("[authService.register] Registration response from Django REST API:", data);

    if (data && data.token) {
      localStorage.setItem('ss_token', data.token);
      localStorage.setItem('ss_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-change'));
    }
    return data.user;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout/', { method: 'POST' });
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  getProfile: async () => {
    const data = await apiRequest('/auth/profile/');
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');
    user.profile = data;
    localStorage.setItem('ss_user', JSON.stringify(user));
    return data;
  },

  updateProfile: async (profileData: any) => {
    const data = await apiRequest('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');
    user.profile = data;
    localStorage.setItem('ss_user', JSON.stringify(user));
    return data;
  },

  getCurrentUser: () => {
    const data = localStorage.getItem('ss_user');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('ss_token');
  }
};

export default authService;
