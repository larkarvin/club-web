import { defineNuxtPlugin } from '#app';
import { toast } from 'vue-sonner';

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      toast: {
        success: (message: string) => toast.success(message),
        error: (message: string) => toast.error(message),
        info: (message: string) => toast.info(message),
        warning: (message: string) => toast.warning(message),
        loading: (message: string) => toast.loading(message),
      },
    },
  };
});
