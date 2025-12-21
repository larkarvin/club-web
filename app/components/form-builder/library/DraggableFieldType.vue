<!-- app/components/form-builder/library/DraggableFieldType.vue -->
<template>
    <div
        class="group rounded-lg border border-stroke bg-white px-4 py-3 transition-all hover:shadow-md hover:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:hover:border-blue-500">
        <div class="flex items-center gap-3">
            <span class="text-2xl">{{ icon }}</span>
            <div class="flex-1">
                <p class="text-sm font-medium text-black dark:text-white">
                    {{ label }}
                </p>
            </div>
            <!-- Add Field Button (always visible, blue) -->
            <button @click="$emit('add-field', type)"
                class="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                title="Add field">
                <span>Add Field</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    type: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    }
})

defineEmits(['add-field'])
</script>
