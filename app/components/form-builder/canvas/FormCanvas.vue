<!-- app/components/form-builder/canvas/FormCanvas.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                Form Preview
                <span v-if="totalFields > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({{ totalFields }} {{ totalFields === 1 ? 'field' : 'fields' }})
                </span>
            </h3>
        </div>
        <div class="p-6.5 min-h-[500px] m-3" @dragover.prevent="handleCanvasDragOver"
            @dragleave="handleCanvasDragLeave" @drop.prevent="handleCanvasDrop" @dragend="handleCanvasDragEnd">
            <!-- Empty State -->
            <EmptyCanvas v-if="rows.length === 0 && !isDraggingFromLibrary" />

            <!-- Drop indicator when dragging from library to empty canvas -->
            <div v-if="rows.length === 0 && isDraggingFromLibrary"
                class="h-2 bg-success-500 rounded-full animate-pulse"></div>

            <!-- Rows List -->
            <div v-else class="space-y-4">
                <template v-for="(row, rowIndex) in rows" :key="row.id">
                    <!-- Drop Indicator (before row) -->
                    <div v-if="shouldShowRowIndicatorBefore(rowIndex)"
                        class="h-2 bg-success-500 rounded-full animate-pulse"></div>

                    <!-- Row with fields -->
                    <div class="field-row-container rounded-lg border-2 border-dashed p-3 transition-all cursor-pointer"
                        :class="[
                            selectedRowId === row.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-transparent hover:border-blue-500'
                        ]"
                        @click.self="handleRowClick(row.id)"
                        @dragover.prevent="handleRowDragOver(rowIndex, $event)"
                        @drop.prevent="handleRowDrop(rowIndex, $event)">

                        <!-- Row Description (Top) -->
                        <div v-if="row.description && row.descriptionPosition !== 'bottom'" class="mb-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400 px-1">{{ row.description }}</p>
                        </div>

                        <!-- Fields in Row -->
                        <div class="flex gap-4">
                            <template v-for="(field, fieldIndex) in row.fields" :key="field.id">
                                <!-- Left Drop Zone Indicator -->
                                <div v-if="shouldShowFieldIndicator(rowIndex, fieldIndex, 'left')"
                                    class="w-1 bg-success-500 rounded-full animate-pulse flex-shrink-0 self-stretch">
                                </div>

                                <!-- Field Card -->
                                <div class="flex-1 min-w-0" :style="{ maxWidth: getFieldWidth(row.fields.length) }">
                                    <FieldCard :field="field" :index="fieldIndex" :row-index="rowIndex"
                                        :selected="field.id === selectedId"
                                        :is-dragging="draggedFieldId === field.id"
                                        :can-accept-more="canRowAcceptField(rowIndex)"
                                        :is-dragging-field="draggedFieldId !== null"
                                        @select="$emit('select', field.id)"
                                        @delete="$emit('delete', field.id)"
                                        @drag-start="handleFieldDragStart(rowIndex, fieldIndex, field.id, $event)"
                                        @drag-over="handleFieldDragOver(rowIndex, fieldIndex, $event)"
                                        @drag-over-left="setDropTarget(rowIndex, fieldIndex, 'left')"
                                        @drag-over-right="setDropTarget(rowIndex, fieldIndex, 'right')"
                                        @drag-over-center="setDropTarget(rowIndex, fieldIndex, 'center')"
                                        @drag-end="handleFieldDragEnd"
                                        @drop="(dropData) => handleFieldDrop(rowIndex, fieldIndex, dropData)">
                                        <TextFieldPreview :field="field" />
                                    </FieldCard>
                                </div>

                                <!-- Right Drop Zone Indicator (after last field) -->
                                <div v-if="fieldIndex === row.fields.length - 1 && shouldShowFieldIndicator(rowIndex, fieldIndex, 'right')"
                                    class="w-1 bg-success-500 rounded-full animate-pulse flex-shrink-0 self-stretch">
                                </div>
                            </template>
                        </div>

                        <!-- Row Description (Bottom) -->
                        <div v-if="row.description && row.descriptionPosition === 'bottom'" class="mt-2">
                            <p class="text-sm text-gray-500 dark:text-gray-400 px-1">{{ row.description }}</p>
                        </div>
                    </div>
                </template>

                <!-- Drop Indicator (after last row) -->
                <div v-if="shouldShowRowIndicatorAfter()" class="h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import EmptyCanvas from './EmptyCanvas.vue'
import FieldCard from './FieldCard.vue'
import TextFieldPreview from '../fields/TextFieldPreview.vue'

const props = defineProps({
    rows: {
        type: Array,
        default: () => []
    },
    selectedId: {
        type: String,
        default: null
    },
    selectedRowId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['add-field', 'add-field-to-row', 'select', 'delete', 'reorder-rows', 'move-field', 'select-row'])

// Computed
const totalFields = computed(() => {
    return props.rows.reduce((sum, row) => sum + row.fields.length, 0)
})

// Drag state
const isDraggingFromLibrary = ref(false)
const draggedFieldId = ref(null)
const draggedFromRow = ref(null)
const draggedFromIndex = ref(null)
const dropRowIndex = ref(null)
const dropTarget = ref(null) // { rowIndex, fieldIndex, position: 'left'|'right'|'center' }
const pendingFieldType = ref(null)

// Calculate field width based on count (max 2 columns)
const getFieldWidth = (fieldCount) => {
    switch (fieldCount) {
        case 1: return '100%'
        case 2: return 'calc(50% - 0.5rem)'
        default: return '100%'
    }
}

// Check if a row can accept a field (considering if we're moving from same row) - max 2 columns
const canRowAcceptField = (rowIndex) => {
    const row = props.rows[rowIndex]
    if (!row) return false

    // If we're dragging a field from the SAME row, count is effectively -1
    if (draggedFieldId.value && draggedFromRow.value === rowIndex) {
        return row.fields.length <= 2 // Will be 1 or less after removing
    }

    // If dragging from a different row, check if target has space
    if (draggedFieldId.value && draggedFromRow.value !== null) {
        return row.fields.length < 2
    }

    // For library drags
    return row.fields.length < 2
}

// Set drop target for visual indicators
const setDropTarget = (rowIndex, fieldIndex, position) => {
    dropTarget.value = { rowIndex, fieldIndex, position }
}

// Check if should show field indicator
const shouldShowFieldIndicator = (rowIndex, fieldIndex, side) => {
    if (!dropTarget.value) return false
    if (dropTarget.value.rowIndex !== rowIndex) return false
    if (dropTarget.value.fieldIndex !== fieldIndex) return false
    if (dropTarget.value.position !== side) return false

    // Use the same logic as canRowAcceptField
    return canRowAcceptField(rowIndex) || draggedFieldId.value !== null
}

// Handle drag from component library to canvas
const handleCanvasDragOver = (event) => {
    event.preventDefault()
    // Check for fieldType (browsers normalize to lowercase in types array)
    const hasFieldType = event.dataTransfer.types.includes('fieldtype') ||
                         event.dataTransfer.types.includes('fieldType') ||
                         window.__draggedFieldType
    if (hasFieldType) {
        isDraggingFromLibrary.value = true
        // Use window fallback since getData doesn't work during dragover in some browsers
        if (window.__draggedFieldType) {
            pendingFieldType.value = window.__draggedFieldType
        }
    }
}

const handleCanvasDragLeave = (event) => {
    // Only clear if actually leaving the canvas entirely (not entering a child)
    const relatedTarget = event.relatedTarget
    if (!event.currentTarget.contains(relatedTarget)) {
        isDraggingFromLibrary.value = false
        dropRowIndex.value = null
        dropTarget.value = null
    }
}

const handleCanvasDragEnd = () => {
    clearDragState()
}

const handleCanvasDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()

    // Try multiple ways to get the field type
    let fieldType = window.__draggedFieldType
    if (!fieldType) {
        try {
            fieldType = event.dataTransfer.getData('fieldType')
        } catch (e) {
            // Ignore
        }
    }
    if (!fieldType) {
        fieldType = pendingFieldType.value
    }

    if (fieldType) {
        // Add as new row
        if (dropRowIndex.value !== null) {
            emit('add-field', fieldType, dropRowIndex.value)
        } else {
            emit('add-field', fieldType)
        }
    }

    clearDragState()
}

// Handle row-level drag over
const handleRowDragOver = (rowIndex, event) => {
    event.preventDefault()

    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const height = rect.height

    // Top half = insert before, bottom half = insert after
    if (y < height / 2) {
        dropRowIndex.value = rowIndex
    } else {
        dropRowIndex.value = rowIndex + 1
    }
}

const handleRowDrop = (rowIndex, event) => {
    // Handled by field drop or canvas drop
}

// Row selection
const handleRowClick = (rowId) => {
    emit('select-row', rowId)
}

// Field drag handlers
const handleFieldDragStart = (rowIndex, fieldIndex, fieldId, event) => {
    draggedFieldId.value = fieldId
    draggedFromRow.value = rowIndex
    draggedFromIndex.value = fieldIndex
    isDraggingFromLibrary.value = false
}

const handleFieldDragOver = (rowIndex, fieldIndex, event) => {
    event.preventDefault()
}

const handleFieldDragEnd = () => {
    clearDragState()
}

const handleFieldDrop = (rowIndex, fieldIndex, dropData) => {
    // Capture values before they get cleared
    const currentDraggedFieldId = draggedFieldId.value
    const currentFromRow = draggedFromRow.value
    const currentFromIndex = draggedFromIndex.value

    // Get field type - prefer from dropData (captured at drop time), then window, then pending
    let fieldType = dropData?.fieldType || window.__draggedFieldType || pendingFieldType.value

    const position = dropData?.position || 'center'

    // If dropping from library (new field) - fieldType exists and no field is being dragged
    if (fieldType && !currentDraggedFieldId) {
        if (position === 'left' || position === 'right') {
            // Add to existing row
            emit('add-field-to-row', fieldType, rowIndex, position, fieldIndex)
        } else {
            // Add as new row below
            emit('add-field', fieldType, rowIndex + 1)
        }
    }
    // If reordering existing field
    else if (currentDraggedFieldId) {
        emit('move-field', {
            fromRowIndex: currentFromRow,
            fromFieldIndex: currentFromIndex,
            toRowIndex: rowIndex,
            toFieldIndex: fieldIndex,
            position
        })
    }

    clearDragState()
}

// Helper to show row indicators
const shouldShowRowIndicatorBefore = (index) => {
    if (dropRowIndex.value !== index) return false
    if (!isDraggingFromLibrary.value && draggedFieldId.value === null) return false
    // Only show for new row drops (center position or no specific target)
    if (dropTarget.value && (dropTarget.value.position === 'left' || dropTarget.value.position === 'right')) {
        return false
    }
    return true
}

const shouldShowRowIndicatorAfter = () => {
    if (dropRowIndex.value !== props.rows.length) return false
    if (!isDraggingFromLibrary.value && draggedFieldId.value === null) return false
    if (dropTarget.value && (dropTarget.value.position === 'left' || dropTarget.value.position === 'right')) {
        return false
    }
    return true
}

const clearDragState = () => {
    isDraggingFromLibrary.value = false
    draggedFieldId.value = null
    draggedFromRow.value = null
    draggedFromIndex.value = null
    dropRowIndex.value = null
    dropTarget.value = null
    pendingFieldType.value = null
    window.__draggedFieldType = null
}

// Global dragend listener
onMounted(() => {
    window.addEventListener('dragend', handleGlobalDragEnd)
})

onUnmounted(() => {
    window.removeEventListener('dragend', handleGlobalDragEnd)
})

const handleGlobalDragEnd = () => {
    clearDragState()
}
</script>
