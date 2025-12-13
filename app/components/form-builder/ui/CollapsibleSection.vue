<!-- app/components/form-builder/ui/CollapsibleSection.vue -->
<template>
    <div class="border-b border-stroke dark:border-strokedark">
        <!-- Header (clickable) -->
        <button @click="toggleCollapse"
            class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
            <h4 class="font-medium text-black dark:text-white uppercase text-sm tracking-wide">
                {{ title }}
            </h4>
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <!-- Content (collapsible) -->
        <div v-show="isOpen" class="px-6 pb-6 space-y-4">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    defaultOpen: {
        type: Boolean,
        default: false
    }
})

const isOpen = ref(props.defaultOpen)

const toggleCollapse = () => {
    isOpen.value = !isOpen.value
}

// Watch for external changes to defaultOpen
watch(() => props.defaultOpen, (newVal) => {
    isOpen.value = newVal
})
</script>