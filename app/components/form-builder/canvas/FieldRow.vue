<!-- app/components/form-builder/canvas/FieldRow.vue -->
<template>
    <div class="field-row" @dragover.prevent="handleRowDragOver" @dragleave="handleRowDragLeave"
        @drop.prevent="handleRowDrop">
        <!-- Row Description (optional) -->
        <div v-if="row.description || isEditingDescription" class="mb-2">
            <input v-if="isEditingDescription" v-model="descriptionInput" @blur="saveDescription" @keyup.enter="saveDescription"
                type="text" placeholder="Row description (optional)"
                class="w-full text-sm text-gray-500 dark:text-gray-400 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none focus:border-brand-500 px-1 py-0.5"
                ref="descriptionInputRef" />
            <p v-else @click="startEditingDescription"
                class="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                {{ row.description }}
            </p>
        </div>

        <!-- Fields Grid -->
        <div class="flex gap-4">
            <template v-for="(field, fieldIndex) in row.fields" :key="field.id">
                <!-- Left Drop Zone -->
                <div v-if="showLeftDropZone(fieldIndex)"
                    class="w-1 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>

                <!-- Field Card -->
                <div class="flex-1 min-w-0" :style="{ maxWidth: getFieldWidth(row.fields.length) }">
                    <FieldCard :field="field" :index="fieldIndex" :row-index="rowIndex"
                        :selected="field.id === selectedId" :is-dragging="isDraggingField(field.id)"
                        :can-drop-left="canDropLeft(fieldIndex)" :can-drop-right="canDropRight(fieldIndex)"
                        @select="$emit('select', field.id)" @delete="$emit('delete', field.id)"
                        @drag-start="handleFieldDragStart(fieldIndex, $event)"
                        @drag-over-left="handleFieldDragOverSide(fieldIndex, 'left', $event)"
                        @drag-over-right="handleFieldDragOverSide(fieldIndex, 'right', $event)"
                        @drag-over-center="handleFieldDragOverCenter(fieldIndex, $event)"
                        @drag-end="handleFieldDragEnd" @drop="handleFieldDrop(fieldIndex, $event)">
                        <TextFieldPreview :field="field" />
                    </FieldCard>
                </div>

                <!-- Right Drop Zone (only after last field) -->
                <div v-if="fieldIndex === row.fields.length - 1 && showRightDropZone()"
                    class="w-1 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
            </template>
        </div>

        <!-- Add Description Button (when no description) -->
        <button v-if="!row.description && !isEditingDescription" @click="startEditingDescription"
            class="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add row description
        </button>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import FieldCard from './FieldCard.vue'
import TextFieldPreview from '../fields/TextFieldPreview.vue'

const props = defineProps({
    row: {
        type: Object,
        required: true
    },
    rowIndex: {
        type: Number,
        required: true
    },
    selectedId: {
        type: String,
        default: null
    },
    draggedFieldId: {
        type: String,
        default: null
    },
    dropTarget: {
        type: Object,
        default: null
    }
})

const emit = defineEmits([
    'select',
    'delete',
    'field-drag-start',
    'field-drag-over',
    'field-drag-end',
    'field-drop',
    'update-description'
])

// Description editing
const isEditingDescription = ref(false)
const descriptionInput = ref('')
const descriptionInputRef = ref(null)

const startEditingDescription = () => {
    descriptionInput.value = props.row.description || ''
    isEditingDescription.value = true
    nextTick(() => {
        descriptionInputRef.value?.focus()
    })
}

const saveDescription = () => {
    emit('update-description', props.rowIndex, descriptionInput.value)
    isEditingDescription.value = false
}

// Calculate field width based on count
const getFieldWidth = (fieldCount) => {
    switch (fieldCount) {
        case 1: return '100%'
        case 2: return 'calc(50% - 0.5rem)'
        case 3: return 'calc(33.333% - 0.667rem)'
        default: return '100%'
    }
}

// Check if field is being dragged
const isDraggingField = (fieldId) => {
    return props.draggedFieldId === fieldId
}

// Check if we can drop on left/right of a field
const canDropLeft = (fieldIndex) => {
    return props.row.fields.length < 3
}

const canDropRight = (fieldIndex) => {
    return props.row.fields.length < 3
}

// Show drop zones based on current drag target
const showLeftDropZone = (fieldIndex) => {
    if (!props.dropTarget) return false
    return props.dropTarget.rowIndex === props.rowIndex &&
        props.dropTarget.fieldIndex === fieldIndex &&
        props.dropTarget.position === 'left'
}

const showRightDropZone = () => {
    if (!props.dropTarget) return false
    return props.dropTarget.rowIndex === props.rowIndex &&
        props.dropTarget.position === 'right' &&
        props.dropTarget.fieldIndex === props.row.fields.length - 1
}

// Drag handlers
const handleFieldDragStart = (fieldIndex, event) => {
    emit('field-drag-start', props.rowIndex, fieldIndex, event)
}

const handleFieldDragOverSide = (fieldIndex, side, event) => {
    emit('field-drag-over', {
        rowIndex: props.rowIndex,
        fieldIndex,
        position: side
    }, event)
}

const handleFieldDragOverCenter = (fieldIndex, event) => {
    // Center means drop as new row above/below
    emit('field-drag-over', {
        rowIndex: props.rowIndex,
        fieldIndex,
        position: 'center'
    }, event)
}

const handleFieldDragEnd = () => {
    emit('field-drag-end')
}

const handleFieldDrop = (fieldIndex, event) => {
    emit('field-drop', {
        rowIndex: props.rowIndex,
        fieldIndex
    }, event)
}

const handleRowDragOver = (event) => {
    // Handle when dragging over empty space in row
}

const handleRowDragLeave = (event) => {
    // Handle leaving row
}

const handleRowDrop = (event) => {
    // Handle drop on row
}
</script>

<style scoped>
.field-row {
    position: relative;
}
</style>
