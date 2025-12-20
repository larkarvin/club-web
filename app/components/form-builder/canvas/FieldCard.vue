<!-- app/components/form-builder/canvas/FieldCard.vue -->
<template>
    <div class="field-card-wrapper relative" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave"
        @drop.prevent="handleDrop">
        <!-- Main Card -->
        <div draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd"
            class="field-card group relative rounded-lg border transition-all dark:bg-boxdark cursor-pointer"
            :class="[
                selected
                    ? 'border-blue-500 bg-blue-50 shadow-md dark:border-blue-500 dark:bg-blue-900/20'
                    : 'border-stroke bg-white dark:border-strokedark hover:border-blue-500',
                isDragging ? 'opacity-50' : 'opacity-100'
            ]" @click="emit('select')">
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
                        <!-- Column indicator -->
                        <span v-if="field.columns && field.columns < 12"
                            class="text-xs text-gray-400 dark:text-gray-500">
                            {{ getColumnLabel(field.columns) }}
                        </span>
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
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    rowIndex: {
        type: Number,
        default: 0
    },
    selected: {
        type: Boolean,
        default: false
    },
    isDragging: {
        type: Boolean,
        default: false
    },
    canAcceptMore: {
        type: Boolean,
        default: true
    },
    isDraggingField: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'select',
    'delete',
    'drag-start',
    'drag-over',
    'drag-over-left',
    'drag-over-right',
    'drag-over-center',
    'drag-end',
    'drop'
])

const dragZone = ref(null) // 'left', 'right', 'center'

const getColumnLabel = (columns) => {
    switch (columns) {
        case 6: return '1/2'
        case 4: return '1/3'
        default: return ''
    }
}

const handleDelete = () => {
    if (confirm('Are you sure you want to delete this field?')) {
        emit('delete')
    }
}

const handleDragStart = (event) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('fieldId', props.field.id)
    event.dataTransfer.setData('fieldIndex', props.index.toString())
    event.dataTransfer.setData('rowIndex', props.rowIndex.toString())
    emit('drag-start', event)
}

const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width

    // Use 30% zones for clearer left/right detection
    const leftThreshold = width * 0.30
    const rightThreshold = width * 0.70

    let newZone = 'center'

    // When row can accept more OR we're moving an existing field, allow left/right
    const canDoLeftRight = props.canAcceptMore || props.isDraggingField

    if (canDoLeftRight) {
        if (x < leftThreshold) {
            newZone = 'left'
        } else if (x > rightThreshold) {
            newZone = 'right'
        }
    }

    // Always update and emit to ensure parent stays in sync
    dragZone.value = newZone
    if (newZone === 'left') {
        emit('drag-over-left', event)
    } else if (newZone === 'right') {
        emit('drag-over-right', event)
    } else {
        emit('drag-over-center', event)
    }

    emit('drag-over', event)
}

const handleDragLeave = (event) => {
    // Only clear if actually leaving the element
    if (!event.currentTarget.contains(event.relatedTarget)) {
        dragZone.value = null
    }
}

const handleDragEnd = (event) => {
    dragZone.value = null
    emit('drag-end', event)
}

const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()

    // Capture field type immediately before it gets cleared
    const fieldType = window.__draggedFieldType

    // Try to get from dataTransfer as backup
    let dataTransferType = null
    try {
        dataTransferType = event.dataTransfer?.getData('fieldType')
    } catch (e) {
        // Ignore
    }

    // Recalculate zone at drop time to be accurate
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const width = rect.width
    const leftThreshold = width * 0.30
    const rightThreshold = width * 0.70
    const canDoLeftRight = props.canAcceptMore || props.isDraggingField

    let finalZone = 'center'
    if (canDoLeftRight) {
        if (x < leftThreshold) {
            finalZone = 'left'
        } else if (x > rightThreshold) {
            finalZone = 'right'
        }
    }

    const dropData = {
        position: finalZone,
        fieldIndex: props.index,
        rowIndex: props.rowIndex,
        fieldType: fieldType || dataTransferType // Include the field type in dropData
    }

    dragZone.value = null

    emit('drop', dropData, event)
}
</script>

<style scoped>
.field-card-wrapper {
    position: relative;
}
</style>
