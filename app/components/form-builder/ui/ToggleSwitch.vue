<!-- app/components/form-builder/ui/ToggleSwitch.vue -->
<template>
    <label :for="inputId" class="flex cursor-pointer select-none items-center justify-between gap-3">
        <!-- Label and Subtext -->
        <div class="flex-1">
            <span class="text-sm font-medium text-black dark:text-white">
                {{ label }}
            </span>
            <p v-if="subtext" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ subtext }}
            </p>
        </div>

        <!-- Toggle Switch -->
        <div class="relative flex-shrink-0">
            <input :id="inputId" type="checkbox" :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)" class="sr-only" />
            <div class="block h-6 w-11 rounded-full transition"
                :class="modelValue ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-800'"></div>
            <div class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition duration-300 ease-linear"
                :class="{ 'translate-x-full': modelValue }"></div>
        </div>
    </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        required: true
    },
    subtext: {
        type: String,
        default: ''
    }
})

defineEmits(['update:modelValue'])

// Generate unique ID for accessibility
const inputId = computed(() => `toggle-${Math.random().toString(36).substr(2, 9)}`)
</script>
