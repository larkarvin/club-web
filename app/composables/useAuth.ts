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
}
interface RegisterData {
  club_name: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const { $api } = useNuxtApp();
  const router = useRouter();
  const config = useRuntimeConfig();

  // Get token cookie name from config
  const tokenCookieName = config.public.auth?.provider?.token?.cookieName || 'accessToken';

  const register = async (data: RegisterData) => {
    try {
      const response = await $api.post<AuthResponse>('/register', data);
      console.log('✅ Registration successful:', response);

      // ✅ Save the token to cookie (THIS IS IMPORTANT!)
      if (response.token) {
        const tokenCookie = useCookie(tokenCookieName);
        tokenCookie.value = response.token;
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

  const login = async (data: { email: string; password: string }) => {
    const response = await $api.post('/login', data);
    return response;
  };

  const logout = async () => {
    await $api.post('/logout');
  };

  return {
    register,
    login,
    logout,
  };
};
