// composables/useAuth.ts
// Simple auth composable - localStorage for token, useState for user

interface User {
  id: number;
  name: string;
  email: string;
  clubs: Array<{
    id: number;
    subdomain: string;
    role: string;
  }>;
}

export function useAuth() {
  const user = useState<User | null>('user', () => null);

  // Token helpers
  const getToken = () => {
    if (import.meta.server) return null;
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  };

  const setToken = (token: string | null) => {
    if (import.meta.server) return;
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch {
      // ignore
    }
  };

  const isLoggedIn = computed(() => {
    if (import.meta.server) return false;
    return !!getToken();
  });

  // Fetch user
  const fetchUser = async () => {
    if (!getToken()) {
      user.value = null;
      return null;
    }
    try {
      const { $api } = useNuxtApp();
      const response = await $api.get<User>('/auth/me');
      user.value = response;
      return response;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      user.value = null;
      return null;
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const { $api } = useNuxtApp();
      const response = await $api.post<any>('/login', { email, password });
      if (response.token) {
        setToken(response.token);
        user.value = response.user;
      }
      return { success: true, data: response };
    } catch (error: any) {
      // $fetch throws FetchError with data property containing response body
      const message = error.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { $api } = useNuxtApp();
      await $api.post('/logout');
    } catch {
      // ignore
    }
    setToken(null);
    user.value = null;
    navigateTo('/login');
  };

  // Register
  const register = async (data: any) => {
    try {
      const { $api } = useNuxtApp();
      const response = await $api.post<any>('/register', data);
      if (response.token) {
        setToken(response.token);
        user.value = response.user;
      }
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, errors: error.response?._data?.errors || {} };
    }
  };

  return {
    user,
    isLoggedIn,
    getToken,
    setToken,
    fetchUser,
    login,
    logout,
    register,
    // Aliases
    isAuthenticated: isLoggedIn,
  };
}

// Also export as useAuth for compatibility
export const useAuthComposable = useAuth;
