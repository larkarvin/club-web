<!-- app/components/form-builder/canvas/FormCanvas.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                Form Preview
                <span v-if="fields.length > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({{ fields.length }} {{ fields.length === 1 ? 'field' : 'fields' }})
                </span>
            </h3>
        </div>
        <div class="p-6.5 min-h-[500px] m-3" style="pointer-events: all;" @dragover.prevent="handleCanvasDragOver"
            @dragleave="handleCanvasDragLeave" @drop.prevent="handleCanvasDrop" @dragend="handleCanvasDragEnd">
            <!-- Empty State -->
            <EmptyCanvas v-if="fields.length === 0 && !isDraggingFromLibrary" />

            <!-- Drop indicator when dragging from library to empty canvas -->
            <div v-if="fields.length === 0 && isDraggingFromLibrary"
                class="h-2 bg-success-500 rounded-full animate-pulse"></div>

            <!-- Fields List -->
            <div v-else class="space-y-4">
                <template v-for="(field, index) in fields" :key="field.id">
                    <!-- Drop Indicator (before field) -->
                    <div v-if="shouldShowIndicatorBefore(index)" class="h-2 bg-success-500 rounded-full animate-pulse">
                    </div>

                    <FieldCard :field="field" :index="index" :selected="field.id === selectedId"
                        :is-dragging="draggedFieldIndex === index" @select="$emit('select', field.id)"
                        @delete="$emit('delete', field.id)" @drag-start="handleFieldDragStart(index, $event)"
                        @drag-over="handleFieldDragOver(index, $event)" @drag-end="handleFieldDragEnd"
                        @drop="handleFieldDrop(index, $event)">
                        <TextFieldPreview :field="field" />
                    </FieldCard>
                </template>

                <!-- Drop Indicator (after last field) -->
                <div v-if="shouldShowIndicatorAfter()" class="h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import EmptyCanvas from './EmptyCanvas.vue'
import FieldCard from './FieldCard.vue'
import TextFieldPreview from '../fields/TextFieldPreview.vue'

const props = defineProps({
    fields: {
        type: Array,
        default: () => []
    },
    selectedId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['add-field', 'select', 'delete', 'reorder'])

const isDraggingFromLibrary = ref(false)
const draggedFieldIndex = ref(null)
const dragOverIndex = ref(null)
const pendingFieldType = ref(null) // Store field type to prevent race condition

// Handle drag from component library to canvas
const handleCanvasDragOver = (event) => {
    event.preventDefault()
    const hasFieldType = event.dataTransfer.types.includes('fieldtype')
    console.log('[DRAGOVER] hasFieldType:', hasFieldType, 'types:', event.dataTransfer.types)
    if (hasFieldType) {
        isDraggingFromLibrary.value = true
        // Try to get the field type early (works in some browsers)
        try {
            const type = event.dataTransfer.getData('fieldType')
            console.log('[DRAGOVER] Got fieldType:', type)
            if (type) pendingFieldType.value = type
        } catch (e) {
            console.log('[DRAGOVER] Cannot get fieldType during dragover:', e.message)
        }
    }
}

const handleCanvasDragLeave = (event) => {
    // Only reset if leaving the canvas container
    if (event.target === event.currentTarget) {
        console.log('[DRAGLEAVE] Leaving canvas - clearing states')
        isDraggingFromLibrary.value = false
        dragOverIndex.value = null
    }
}

const handleCanvasDragEnd = () => {
    console.log('[CANVAS DRAGEND] Clearing states')
    isDraggingFromLibrary.value = false
    dragOverIndex.value = null
}

const handleCanvasDrop = (event) => {
    console.log('[DROP] Drop event triggered')
    event.preventDefault()
    event.stopPropagation()

    // Priority order: window variable (instant) > dataTransfer > pendingFieldType
    const fieldType = window.__draggedFieldType || event.dataTransfer.getData('fieldType') || pendingFieldType.value

    console.log('[DROP] window.__draggedFieldType:', window.__draggedFieldType)
    console.log('[DROP] fieldType from getData:', event.dataTransfer.getData('fieldType'))
    console.log('[DROP] pendingFieldType:', pendingFieldType.value)
    console.log('[DROP] Final fieldType:', fieldType)
    console.log('[DROP] dragOverIndex:', dragOverIndex.value)

    if (fieldType) {
        console.log('[DROP] Adding field:', fieldType, 'at index:', dragOverIndex.value)
        // Add field at the drop position
        if (dragOverIndex.value !== null) {
            emit('add-field', fieldType, dragOverIndex.value)
        } else {
            emit('add-field', fieldType)
        }
    } else {
        console.log('[DROP] No fieldType - field NOT added!')
    }

    // Clear states
    isDraggingFromLibrary.value = false
    dragOverIndex.value = null
    pendingFieldType.value = null
    window.__draggedFieldType = null

    console.log('[DROP] States cleared')
}

// Handle field reordering
const handleFieldDragStart = (index, event) => {
    draggedFieldIndex.value = index
    isDraggingFromLibrary.value = false
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('fieldIndex', index.toString())
}

const handleFieldDragOver = (index, event) => {
    event.preventDefault()
    event.stopPropagation()

    // Determine if we should show indicator above or below the current field
    const rect = event.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2

    if (event.clientY < midpoint) {
        // Show indicator above this field
        dragOverIndex.value = index
    } else {
        // Show indicator below this field
        dragOverIndex.value = index + 1
    }
}

const handleFieldDragEnd = () => {
    draggedFieldIndex.value = null
    dragOverIndex.value = null
    isDraggingFromLibrary.value = false
}

const handleFieldDrop = (dropIndex, event) => {
    event.preventDefault()
    event.stopPropagation()

    const dragIndex = parseInt(event.dataTransfer.getData('fieldIndex'))

    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
        // Calculate the actual drop position
        let actualDropIndex = dragOverIndex.value !== null ? dragOverIndex.value : dropIndex

        // Adjust for dropping after the dragged item
        if (dragIndex < actualDropIndex) {
            actualDropIndex--
        }

        emit('reorder', dragIndex, actualDropIndex)
    }

    draggedFieldIndex.value = null
    dragOverIndex.value = null
}

// Helper to determine if indicator should show before a field
const shouldShowIndicatorBefore = (index) => {
    if (dragOverIndex.value !== index) return false

    // When dragging from library, always show
    if (isDraggingFromLibrary.value) return true

    // When reordering existing field:
    // Don't show indicator at the position right after the dragged field
    // (because that's effectively the same position)
    if (draggedFieldIndex.value !== null && draggedFieldIndex.value === index - 1) {
        return false
    }

    return true
}

// Helper to determine if indicator should show after last field
const shouldShowIndicatorAfter = () => {
    if (dragOverIndex.value !== props.fields.length) return false

    // CHANGED: Always show indicator when dragging, even at same position
    // This gives visual feedback that reordering is active
    return true
}
// Add global dragend listener to catch drag cancellations
onMounted(() => {
    window.addEventListener('dragend', handleGlobalDragEnd)
})

onUnmounted(() => {
    window.removeEventListener('dragend', handleGlobalDragEnd)
})

const handleGlobalDragEnd = () => {
    console.log('[GLOBAL DRAGEND] Clearing all drag states')
    // Clear all drag states when any drag operation ends
    isDraggingFromLibrary.value = false
    dragOverIndex.value = null
    draggedFieldIndex.value = null
    pendingFieldType.value = null
    window.__draggedFieldType = null
}
</script>