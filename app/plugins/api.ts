import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#app';
import type { FetchError } from 'ofetch';
import { authToken } from '~/composables/useAuth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  // Create a base $fetch instance
  const $api = $fetch.create({
    baseURL: config.public.api.apiURL,

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    async onRequest({ options }) {
      // Attach auth token from state
      if (authToken.value) {
        options.headers = options.headers || {};
        // @ts-ignore
        options.headers['Authorization'] = `Bearer ${authToken.value}`;
      }
    },

    async onResponse({ response }) {
      // Optional: Log successful responses in development
      if (process.dev) {
        console.log('✅ API Response:', response.status, response.url);
      }
    },

    async onResponseError({ response, options }) {
      const status = response.status;
      const url = options.baseURL + (options.url || '');

      // Log error details
      console.error(`❌ API Error [${status}]:`, {
        url,
        message: response._data?.message,
        errors: response._data?.errors,
      });

      // Handle different error types
      switch (status) {
        case 401: // Unauthorized
          nuxtApp.$toast.error('Session expired. Please login again.');

          // Clear auth token and redirect to login
          const tokenName = config.public.auth?.provider?.token?.cookieName || 'accessToken';
          useCookie(tokenName).value = null;

          // Avoid redirect loop
          if (router.currentRoute.value.path !== '/login') {
            await router.push('/login');
          }
          break;

        case 403: // Forbidden
          nuxtApp.$toast.error("You don't have permission to access this.");
          break;

        case 404: // Not Found
          nuxtApp.$toast.error('Resource not found');
          break;

        case 419: // CSRF Token Mismatch (Laravel)
          console.error('CSRF token mismatch. Refreshing...');
          if (process.client) {
            window.location.reload();
          }
          break;

        case 422: // Validation Error (Laravel)
          // Don't show toast for validation errors (handle in forms)
          console.warn('Validation errors:', response._data?.errors);
          break;

        case 429: // Too Many Requests
          nuxtApp.$toast.warning('Too many requests. Please slow down.');
          const retryAfter = response.headers.get('Retry-After');
          console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
          break;

        case 500: // Server Error
        case 502:
        case 503:
          nuxtApp.$toast.error('Server error. Please try again later.');
          break;

        default:
          console.error('Unexpected error:', response._data);
      }
    },

    // Handle network errors (no response from server)
    async onRequestError({ error }) {
      console.error('Network Error:', error);
      nuxtApp.$toast.error('Network error. Please check your connection.');
    },
  });

  // Enhanced shortcut methods with better typing
  const api = {
    // Raw request method
    request: $api,

    // GET
    get: <T = unknown>(endpoint: string, options?: RequestInit) => $api<T>(endpoint, { method: 'GET', ...options }),

    // POST
    post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
      $api<T>(endpoint, { method: 'POST', body, ...options }),

    // PUT
    put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
      $api<T>(endpoint, { method: 'PUT', body, ...options }),

    // PATCH
    patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestInit) =>
      $api<T>(endpoint, { method: 'PATCH', body, ...options }),

    // DELETE
    delete: <T = unknown>(endpoint: string, options?: RequestInit) =>
      $api<T>(endpoint, { method: 'DELETE', ...options }),

    // Utility method to check if error is a FetchError
    isFetchError: (error: unknown): error is FetchError => {
      return error instanceof Error && 'response' in error;
    },

    // Extract Laravel validation errors
    getValidationErrors: (error: unknown): Record<string, string[]> => {
      if (api.isFetchError(error)) {
        return error.response?._data?.errors || {};
      }
      return {};
    },
  };

  return {
    provide: {
      api, // accessible via useNuxtApp().$api or const { $api } = useNuxtApp()
    },
  };
});
