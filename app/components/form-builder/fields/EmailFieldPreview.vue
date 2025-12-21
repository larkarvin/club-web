<!-- app/components/form-builder/fields/EmailFieldPreview.vue -->
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

        <!-- Email Input Preview -->
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <input type="email" :placeholder="field.placeholder || 'Enter email address...'" disabled
                :class="[inputClasses, 'pl-10']" />
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
