<!-- app/components/form-builder/fields/TextFieldPreview.vue -->
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

        <!-- Input Preview -->
        <div class="relative">
            <input type="text" :placeholder="field.placeholder || 'Enter text...'" :disabled="field.disabled || true"
                :readonly="field.readonly" :maxlength="field.maxLength" :minlength="field.minLength"
                :class="inputClasses" />

            <!-- Disabled indicator -->
            <div v-if="field.disabled"
                class="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded pointer-events-none flex items-center justify-center">
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">DISABLED</span>
            </div>

            <!-- Read-only indicator -->
            <div v-else-if="field.readonly" class="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
        </div>

        <!-- Validation hints -->
        <div v-if="field.minLength || field.maxLength" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span v-if="field.minLength">Min: {{ field.minLength }} chars</span>
            <span v-if="field.minLength && field.maxLength"> • </span>
            <span v-if="field.maxLength">Max: {{ field.maxLength }} chars</span>
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
    disabled: computed(() => props.field.disabled || true), // Always show as disabled in preview
    readonly: computed(() => props.field.readonly),
    error: undefined,
    success: undefined
})

const inputClasses = computed(() => {
    let base = classes.value

    // Add readonly styling
    if (props.field.readonly) {
        base += ' bg-gray-50 dark:bg-gray-800'
    }

    return base
})
</script>