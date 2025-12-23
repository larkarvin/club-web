<template>
  <FullScreenLayout>
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Signing out...</p>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'Signing Out'
});

const { logout } = useAuth();

onMounted(async () => {
  await logout();
});
</script>
