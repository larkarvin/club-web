<!-- app/components/form-builder/fields/NumberFieldPreview.vue -->
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

        <!-- Number Input Preview -->
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
            </div>
            <input type="number" :placeholder="field.placeholder || 'Enter number...'" disabled :min="field.min"
                :max="field.max" :step="field.allowDecimal ? '0.01' : '1'" :class="[inputClasses, 'pl-10']" />
        </div>

        <!-- Validation hints -->
        <div v-if="field.min !== null || field.max !== null || field.allowDecimal"
            class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
            <span v-if="field.min !== null">Min: {{ field.min }}</span>
            <span v-if="field.max !== null">Max: {{ field.max }}</span>
            <span v-if="field.allowDecimal">Decimals allowed</span>
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

const { classes } = useInputClasses({
    disabled: computed(() => true),
    readonly: computed(() => false),
    error: undefined,
    success: undefined
})

const inputClasses = computed(() => classes.value)
</script>
