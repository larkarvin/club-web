import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { toast } from 'vue-sonner';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Get token from localStorage
  const getToken = (): string | null => {
    if (import.meta.server) return null;
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  };

  // Get subdomain from URL
  const getSubdomain = (): string | null => {
    if (import.meta.server) return null;
    try {
      const host = window.location.hostname;
      const baseDomain = config.public.baseDomain || 'raceyaclub.local';
      if (host.endsWith(`.${baseDomain}`)) {
        const sub = host.replace(`.${baseDomain}`, '');
        if (sub && sub !== 'www' && sub !== 'app' && sub !== 'api') {
          return sub;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Create $fetch instance
  const $api = $fetch.create({
    baseURL: config.public.api.apiURL,

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    async onRequest({ options }) {
      // Add auth token
      const token = getToken();
      if (token) {
        // @ts-ignore
        options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
      }

      // Add subdomain to query params
      const subdomain = getSubdomain();
      if (subdomain) {
        // @ts-ignore
        options.query = { ...options.query, subdomain };
      }
    },

    async onResponse({ response }) {
      // Show success toast if API returns a message (for mutations like POST, PUT, PATCH, DELETE)
      if (import.meta.client && response.ok) {
        const data = response._data;
        if (data?.message && typeof data.message === 'string') {
          toast.success(data.message);
        }
      }
    },

    async onResponseError({ response }) {
      const status = response.status;

      if (status === 401 && import.meta.client) {
        localStorage.removeItem('auth_token');
      }

      // Show error toast for API errors
      if (import.meta.client) {
        const data = response._data;
        if (data?.message && typeof data.message === 'string') {
          toast.error(data.message);
        } else if (status === 422 && data?.errors) {
          // Validation errors - show first error
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            toast.error(firstError[0] as string);
          }
        } else if (status === 500) {
          toast.error('Server error. Please try again later.');
        } else if (status === 404) {
          toast.error('Resource not found.');
        }
      }
    },
  });

  // Simple API methods
  const api = {
    get: <T = unknown>(url: string, options?: any) =>
      $api<T>(url, { method: 'GET', ...options }),

    post: <T = unknown>(url: string, body?: unknown, options?: any) =>
      $api<T>(url, { method: 'POST', body, ...options }),

    put: <T = unknown>(url: string, body?: unknown, options?: any) =>
      $api<T>(url, { method: 'PUT', body, ...options }),

    patch: <T = unknown>(url: string, body?: unknown, options?: any) =>
      $api<T>(url, { method: 'PATCH', body, ...options }),

    delete: <T = unknown>(url: string, options?: any) =>
      $api<T>(url, { method: 'DELETE', ...options }),
  };

  return {
    provide: { api },
  };
});
