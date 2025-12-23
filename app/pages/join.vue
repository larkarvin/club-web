<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex lg:flex-row w-full min-h-screen justify-center flex-col dark:bg-gray-900">
        <!-- Main Content -->
        <div class="flex flex-col flex-1 lg:w-1/2 w-full">
          <div class="w-full max-w-md pt-10 mx-auto">
            <NuxtLink to="/"
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <svg class="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                fill="none">
                <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              Back to home
            </NuxtLink>
          </div>

          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
            <!-- Loading State -->
            <div v-if="isLoadingClub || isCheckingMembership" class="text-center">
              <svg class="animate-spin h-10 w-10 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>

            <!-- Join Content -->
            <template v-else-if="currentClub">
              <!-- Club Info -->
              <div class="text-center mb-8">
                <div
                  class="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <span class="text-4xl font-bold text-brand-600 dark:text-brand-400">
                    {{ currentClub.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Join {{ currentClub.name }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400">
                  You're about to join <strong>{{ currentClub.name }}</strong>. As a member, you'll have access to
                  club forms, events, and more.
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage"
                class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
                {{ errorMessage }}
              </div>

              <!-- Join Button -->
              <div class="space-y-4">
                <button @click="handleJoinClub" :disabled="isJoining"
                  class="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg v-if="isJoining" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  {{ isJoining ? 'Joining...' : 'Join Club' }}
                </button>

                <button @click="handleSkip"
                  class="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  Not now, maybe later
                </button>
              </div>
            </template>

            <!-- No Club Found -->
            <div v-else class="text-center">
              <p class="text-gray-600 dark:text-gray-400 mb-4">No club found to join.</p>
              <NuxtLink to="/"
                class="inline-flex items-center text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Go back home
              </NuxtLink>
            </div>

            <!-- Footer -->
            <div class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Powered by <a href="https://raceyaclub.com" target="_blank"
                  class="text-brand-500 hover:text-brand-600">RaceYa Club</a></p>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative min-h-screen">
          <div class="items-center justify-center flex z-1">
            <common-grid-shape />
            <div class="flex flex-col items-center max-w-xs">
              <NuxtLink to="/" class="block mb-4">
                <img width="231" height="48" src="/images/logo/auth-logo.svg" alt="Logo" />
              </NuxtLink>
              <p class="text-center text-gray-400 dark:text-white/60">Your Club Needs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({})

useHead({
  title: computed(() => currentClub.value ? `Join ${currentClub.value.name}` : 'Join Club')
})

const router = useRouter()
const { isAuthenticated } = useAuth()
const { currentClub, subdomain, fetchClubBySubdomain, joinClub, checkMembership, isLoadingClub } = useClub()

const isJoining = ref(false)
const isCheckingMembership = ref(false)
const errorMessage = ref('')

// Load club and check auth on mount
onMounted(async () => {
  // Load club if not loaded
  if (subdomain.value && !currentClub.value) {
    await fetchClubBySubdomain(subdomain.value)
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  // If already a member or owner, redirect to dashboard
  if (currentClub.value) {
    isCheckingMembership.value = true
    try {
      const membership = await checkMembership(currentClub.value.id)
      if (membership.isMember) {
        router.push('/dashboard')
        return
      }
    } finally {
      isCheckingMembership.value = false
    }
  }
})

// Handle join club
const handleJoinClub = async () => {
  if (!currentClub.value) return

  isJoining.value = true
  errorMessage.value = ''

  try {
    const success = await joinClub(currentClub.value.id)

    if (success) {
      toast.success(`Welcome to ${currentClub.value.name}!`)
      router.push('/dashboard')
    } else {
      errorMessage.value = 'Failed to join club. Please try again.'
    }
  } catch (error: any) {
    console.error('Join error:', error)
    errorMessage.value = error.data?.message || 'Failed to join club. Please try again.'
  } finally {
    isJoining.value = false
  }
}

// Handle skip - go back to home
const handleSkip = () => {
  router.push('/')
}
</script>
