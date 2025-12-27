<!-- pages/dashboard.vue -->
<template>
    <admin-layout>
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-black dark:text-white">
                {{ currentClub ? currentClub.name : 'Dashboard' }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {{ user?.name }}!
            </p>
        </div>

        <!-- Member Dashboard Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Quick Stats Card -->
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Your Membership</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Status</span>
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 dark:text-gray-400">Role</span>
                        <span class="text-black dark:text-white capitalize">{{ membershipStatus?.role || 'Member'
                            }}</span>
                    </div>
                </div>
            </div>

            <!-- Forms Card -->
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Club Forms</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    View and submit club forms
                </p>
                <NuxtLink to="/forms"
                    class="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium">
                    View Forms
                    <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </NuxtLink>
            </div>

            <!-- Events Card (Placeholder) -->
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Upcoming Events</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    No upcoming events
                </p>
                <span class="text-gray-400 text-sm">Coming soon</span>
            </div>
        </div>

        <!-- Recent Activity (Placeholder) -->
        <div class="mt-8 bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Recent Activity</h3>
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="mt-2">No recent activity</p>
            </div>
        </div>
    </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from '~/components/layout/AdminLayout.vue'

definePageMeta({ middleware: ['auth'] })

const router = useRouter()
const { user, fetchUser } = useAuth()
const { club } = useClub()

// Alias for template
const currentClub = club
const memberRole = ref<string | null>(null)
const membershipStatus = computed(() => ({ role: memberRole.value }))

onMounted(async () => {
    if (!user.value) await fetchUser()

    // Use join-check API to verify membership
    try {
        const { $api } = useNuxtApp()
        const response = await $api.get<{ isMember: boolean; role: string | null; club: any }>('/join-check')

        if (response.club) {
            club.value = response.club
        }

        if (!response.isMember) {
            router.push('/join')
            return
        }

        memberRole.value = response.role
    } catch (error) {
        console.error('Failed to check membership:', error)
        router.push('/join')
    }
})
</script>
