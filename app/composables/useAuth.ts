// composables/useAuth.ts
interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  type: string; // "Bearer"
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  club?: {
    id: number;
    name: string;
    subdomain: string;
    status: string;
    mine: boolean;
    created_at: string;
  };
}

interface RegisterClubData {
  club_name: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Global token state (shared across all composable instances)
const authToken = ref<string | null>(null);

export const useAuth = () => {
  const { $api } = useNuxtApp();
  const router = useRouter();

  // User state
  const user = useState<AuthResponse['user'] | null>('auth-user', () => null);

  // Check if authenticated
  const isAuthenticated = computed(() => !!authToken.value);

  // Get current user token
  const getToken = () => authToken.value;

  // Set token (also exposed for external use)
  const setToken = (token: string | null) => {
    authToken.value = token;
  };

  /**
   * Fetch current user data
   */
  const fetchUser = async () => {
    try {
      const tokenCookie = useCookie(tokenCookieName);
      if (!tokenCookie.value) {
        user.value = null;
        return null;
      }

      const response = await $api.get<{ user: AuthResponse['user'] }>('/user');
      user.value = response.user;
      return user.value;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      user.value = null;
      return null;
    }
  };

  /**
   * Register new user and club
   */
  const register = async (data: RegisterClubData) => {
    try {
      const response = await $api.post<AuthResponse>('/register', data);
      console.log('Registration successful:', response);

      // Save the token to cookie
      if (response.token) {
        const tokenCookie = useCookie(tokenCookieName);
        tokenCookie.value = response.token;

        // Save user data
        user.value = response.user;
      }

      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      if (error.response?.status === 422) {
        const errors = $api.getValidationErrors(error);
        return { success: false, errors };
      }
      throw error;
    }
  };

  /**
   * Register user only (no club) - for club subdomain registration
   */
  const registerUserOnly = async (data: RegisterUserData) => {
    try {
      const response = await $api.post<AuthResponse>('/register/user', data);
      console.log('Registration successful:', response);

      // Save the token to cookie
      if (response.token) {
        const tokenCookie = useCookie(tokenCookieName);
        tokenCookie.value = response.token;

        // Save user data
        user.value = response.user;
      }

      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      if (error.response?.status === 422) {
        const errors = $api.getValidationErrors(error);
        return { success: false, errors };
      }
      throw error;
    }
  };

  /**
   * Login user
   */
  const login = async (data: LoginData) => {
    try {
      const response = await $api.post<AuthResponse>('/login', data);

      // Save token to state
      if (response.token) {
        authToken.value = response.token;
        user.value = response.user;
      }

      return { success: true, data: response };
    } catch (error: any) {
      console.error('❌ Login failed:', error);

      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = $api.getValidationErrors(error);
        return { success: false, errors };
      }

      // Handle unauthorized errors (401)
      if (error.response?.status === 401 || error.status === 401) {
        const message = error.response?._data?.message
          || error.data?.message
          || 'Invalid email or password';
        return { success: false, message };
      }

      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await $api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user data
      authToken.value = null;
      user.value = null;

      // Redirect to login
      router.push('/login');
    }
  };

  return {
    // State
    user: readonly(user),
    isAuthenticated,
    authToken: readonly(authToken),

    // Methods
    register,
    registerUserOnly,
    login,
    logout,
    fetchUser,
    getToken,
    setToken,
  };
};

// Export authToken for use in plugins
export { authToken };
