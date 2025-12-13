<!-- app/components/form-builder/fields/TextFieldPreview.vue -->
<template>
    <div class="w-full">
        <!-- Label -->
        <label v-if="field.label" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {{ field.label }}
            <span v-if="field.required" class="text-error-500">*</span>
        </label>

        <!-- Input Preview (disabled to show it's a preview) -->
        <div class="relative">
            <input type="text" :placeholder="field.placeholder || 'Enter text...'" disabled :class="classes" />
        </div>

        <!-- Field Name (shown in preview for clarity) -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
             {{ field.name ? "Field name:" . field.name : '' }}
        </p>
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

// Use the same CSS classes as your BaseInput
const { classes } = useInputClasses({
    disabled: true, // Always disabled in preview
    error: undefined,
    success: undefined
})
</script>