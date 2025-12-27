<template>
  <!-- Club subdomain: Show club front page -->
  <FullScreenLayout v-if="isClubSubdomain">
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex lg:flex-row w-full min-h-screen justify-center flex-col dark:bg-gray-900">
        <!-- Main Content -->
        <div class="flex flex-col flex-1 lg:w-1/2 w-full">
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
            <!-- Club Info -->
            <div class="text-center mb-8" v-if="currentClub">
              <div
                class="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <span class="text-4xl font-bold text-brand-600 dark:text-brand-400">
                  {{ currentClub.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {{ currentClub.name }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400">
                Welcome to our club community
              </p>
            </div>

            <!-- Loading State -->
            <div class="text-center" v-else-if="isLoading">
              <svg class="animate-spin h-8 w-8 mx-auto text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              <p class="mt-4 text-gray-600 dark:text-gray-400">Loading club...</p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-4" v-if="currentClub">
              <!-- Already authenticated -->
              <template v-if="isAuthenticated">
                <NuxtLink to="/dashboard"
                  class="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Go to Dashboard
                </NuxtLink>
              </template>

              <!-- Not authenticated -->
              <template v-else>
                <NuxtLink to="/login"
                  class="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Sign In
                </NuxtLink>

                <NuxtLink to="/register"
                  class="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  Create Account
                </NuxtLink>
              </template>
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

  <!-- App subdomain: Show CRM dashboard (this shouldn't normally show due to middleware redirect) -->
  <admin-layout v-else>
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12">
        <crm-metrics />
      </div>

      <div class="col-span-12 xl:col-span-8">
        <crm-statistics-chart />
      </div>

      <div class="col-span-12 xl:col-span-4">
        <estimated-revenue-chart />
      </div>

      <div class="col-span-12 xl:col-span-6">
        <sale-category-chart />
      </div>

      <div class="col-span-12 xl:col-span-6">
        <upcoming-schedule />
      </div>

      <div class="col-span-12">
        <crm-table />
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import CrmMetrics from '~/components/crm/CrmMetrics.vue';
import CrmStatisticsChart from '~/components/crm/CrmStatisticsChart.vue';
import CrmTable from '~/components/crm/CrmTable.vue';
import EstimatedRevenueChart from '~/components/crm/EstimatedRevenueChart.vue';
import SaleCategoryChart from '~/components/crm/SaleCategoryChart.vue';
import UpcomingSchedule from '~/components/crm/UpcomingSchedule.vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const { club, subdomain, isClubSite, fetchClub } = useClub();
const { isAuthenticated } = useAuth();

// Aliases for template
const currentClub = club;
const isClubSubdomain = isClubSite;

const isLoading = ref(true);

useHead({
  title: computed(() => {
    if (import.meta.server) return 'Loading...';
    if (isClubSubdomain.value && currentClub.value) {
      return currentClub.value.name;
    }
    return 'Dashboard';
  })
});

onMounted(async () => {
  // If on a club subdomain and club not loaded, fetch it
  if (subdomain.value && !currentClub.value) {
    await fetchClub();
  }
  isLoading.value = false;
});
</script>
