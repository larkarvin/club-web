<!-- app/components/form-builder/fields/PhoneFieldPreview.vue -->
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

        <!-- Phone Input Preview -->
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            </div>
            <input type="tel" :placeholder="field.placeholder || 'Enter phone number...'" disabled
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
