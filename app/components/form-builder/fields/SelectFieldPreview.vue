<!-- app/components/form-builder/fields/SelectFieldPreview.vue -->
<template>
    <div class="w-full">
        <!-- Label -->
        <label v-if="field.label" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ field.label }}
            <span v-if="field.required" class="text-meta-1">*</span>
        </label>

        <!-- Description -->
        <p v-if="field.description" class="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {{ field.description }}
        </p>

        <!-- Select Preview -->
        <div class="relative">
            <select disabled :class="selectClasses">
                <option value="" disabled selected>{{ field.placeholder || 'Select an option...' }}</option>
                <option v-for="option in field.options" :key="option.id" :value="option.value">
                    {{ option.label }}
                    <span v-if="option.price > 0"> (+${{ option.price }})</span>
                </option>
            </select>
            <!-- Dropdown arrow -->
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        <!-- Options count hint -->
        <div v-if="field.options && field.options.length > 0" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ field.options.length }} option{{ field.options.length === 1 ? '' : 's' }}
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useInputClasses } from '~/composables/useInputClasses'

const props = defineProps({
    field: {
        type: Object,
        required: true
    }
})

// Compute classes based on field state
const { classes } = useInputClasses({
    disabled: computed(() => true), // Always show as disabled in preview
    readonly: computed(() => false),
    error: undefined,
    success: undefined
})

const selectClasses = computed(() => {
    return classes.value + ' appearance-none pr-10'
})
</script>
