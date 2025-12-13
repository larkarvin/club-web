<!-- app/components/form-builder/canvas/FieldCard.vue -->
<template>
    <div draggable="true" @dragstart="handleDragStart" @dragover.prevent="handleDragOver" @dragend="handleDragEnd"
        @drop.prevent="handleDrop"
        class="field-card group relative rounded-lg border bg-white transition-all dark:bg-boxdark cursor-pointer"
        :class="[
            selected
                ? 'border-success shadow-md dark:border-success'
                : 'border-stroke dark:border-strokedark hover:border-gray-400 dark:hover:border-gray-600',
            isDragging ? 'opacity-50' : 'opacity-100'
        ]" @click="$emit('select')">
        <!-- Drag Handle -->
        <div class="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="5" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="15" cy="5" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="15" cy="19" r="1.5" />
            </svg>
        </div>

        <!-- Field Content with left padding for drag handle -->
        <div class="pl-10 pr-4 py-4">
            <!-- Field Header -->
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span
                        class="inline-flex items-center rounded-full bg-primary/10 py-1 text-xs font-medium text-primary">
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
const props = defineProps({
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
    },
    isDragging: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select', 'delete', 'drag-start', 'drag-over', 'drag-end', 'drop'])

const handleDelete = () => {
    if (confirm('Are you sure you want to delete this field?')) {
        emit('delete')
    }
}

const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('fieldIndex', props.index.toString())
    emit('drag-start', event)
}

const handleDragOver = (event) => {
    emit('drag-over', event)
}

const handleDragEnd = (event) => {
    emit('drag-end', event)
}

const handleDrop = (event) => {
    emit('drop', event)
}
</script>