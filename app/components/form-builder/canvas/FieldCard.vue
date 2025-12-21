<!-- app/components/form-builder/canvas/FieldCard.vue -->
<template>
    <div class="field-card group relative rounded-lg border-2 bg-white transition-all dark:bg-boxdark cursor-grab active:cursor-grabbing"
        :class="[
            selected
                ? 'border-blue-500 bg-blue-50 shadow-md dark:border-blue-500 dark:bg-blue-900/20'
                : 'border-stroke dark:border-strokedark hover:border-blue-500 dark:hover:border-blue-500'
        ]" @click.stop="$emit('select')">

        <!-- Field Content -->
        <div class="px-4 py-4">
            <!-- Field Header -->
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span
                        class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {{ field.type.toUpperCase() }}
                    </span>
                    <span v-if="field.required" class="text-xs text-meta-1">Required</span>
                </div>

                <!-- Delete Button -->
                <button @click.stop="handleDelete"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-meta-1 hover:text-red-600"
                    title="Delete field">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <!-- Field Preview (slot) -->
            <div>
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    field: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    selected: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select', 'delete'])

const handleDelete = () => {
    if (confirm('Are you sure you want to delete this field?')) {
        emit('delete')
    }
}
</script>
