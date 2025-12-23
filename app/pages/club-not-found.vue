<!-- pages/club-not-found.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-boxdark-2 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
            <!-- Error Icon -->
            <div class="mx-auto w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <!-- Error Message -->
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Club Not Found
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
                The club you're looking for doesn't exist or may have been removed.
                Please check the URL and try again.
            </p>

            <!-- Actions -->
            <div class="space-y-4">
                <a :href="wwwUrl"
                    class="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Go to Raceya Club
                </a>
                <button @click="goBack"
                    class="inline-flex items-center justify-center w-full py-3 px-4 border border-gray-300 dark:border-strokedark rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-boxdark hover:bg-gray-50 dark:hover:bg-boxdark-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Go Back
                </button>
            </div>

            <!-- Help Text -->
            <p class="mt-8 text-sm text-gray-500 dark:text-gray-400">
                If you believe this is an error, please contact support.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()

// Build www URL
const wwwUrl = computed(() => {
    const protocol = config.public.protocol || 'http'
    const baseDomain = config.public.baseDomain || 'raceyaclub.local'
    const port = config.public.port ? `:${config.public.port}` : ''
    return `${protocol}://www.${baseDomain}${port}`
})

const goBack = () => {
    if (window.history.length > 1) {
        router.back()
    } else {
        window.location.href = wwwUrl.value
    }
}
</script>
