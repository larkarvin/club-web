<!-- app/components/form-builder/ui/InfoTooltip.vue -->
<template>
    <div class="relative inline-block group">
        <button type="button"
            class="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd" />
            </svg>
        </button>

        <!-- Tooltip -->
        <div v-if="showTooltip"
            class="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-black rounded-lg shadow-lg whitespace-nowrap">
            {{ text }}
            <!-- Arrow -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div class="border-4 border-transparent border-t-black"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    text: {
        type: String,
        required: true
    }
})

const showTooltip = ref(false)
</script>