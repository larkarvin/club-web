<!-- app/components/form-builder/ui/ToggleSwitch.vue -->
<template>
    <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-black dark:text-white">
            {{ label }}
        </label>
        <div>
            <label :for="inputId" class="flex cursor-pointer select-none items-center">
                <div class="relative">
                    <input :id="inputId" type="checkbox" :checked="modelValue"
                        @change="$emit('update:modelValue', $event.target.checked)" class="sr-only" />
                    <div class="block h-8 w-14 rounded-full transition"
                        :class="modelValue ? 'bg-primary' : 'bg-stroke dark:bg-strokedark'"></div>
                    <div class="absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition"
                        :class="{ 'translate-x-full': modelValue }"></div>
                </div>
            </label>
        </div>
    </div>
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
    }
})

defineEmits(['update:modelValue'])

// Generate unique ID for accessibility
const inputId = computed(() => `toggle-${Math.random().toString(36).substr(2, 9)}`)
</script>