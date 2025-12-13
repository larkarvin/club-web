<!-- app/components/form-builder/properties/EmptyProperties.vue -->
<template>
    <div class="flex flex-col items-center justify-center py-16">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No field selected
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500">
            Click on a field to configure its properties
        </p>
    </div>
</template>

<script setup>
// No props or logic needed - pure presentation component
</script>