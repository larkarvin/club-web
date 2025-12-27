<!-- app/components/form-builder/library/DraggableFieldType.vue -->
<template>
    <button
        @click="$emit('add-field', type)"
        class="group flex-shrink-0 rounded-lg border border-stroke bg-white px-3 py-2 lg:px-4 lg:py-3 transition-all hover:shadow-md hover:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:hover:border-blue-500 w-auto lg:w-full"
        :title="`Add ${label} field`"
    >
        <div class="flex items-center gap-2 lg:gap-3">
            <span class="text-lg lg:text-2xl">{{ icon }}</span>
            <p class="text-xs lg:text-sm font-medium text-black dark:text-white whitespace-nowrap">
                {{ label }}
            </p>
            <!-- Plus icon on desktop only -->
            <svg class="hidden lg:block w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
        </div>
    </button>
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
