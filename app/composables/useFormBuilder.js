// composables/useFormBuilder.js
import { ref, computed } from 'vue'
import { useFieldRegistry } from './useFieldRegistry'

export function useFormBuilder() {
  const { createDefaultField } = useFieldRegistry()

  // Form state
  const formName = ref('')
  const formSlug = ref('')
  // Rows structure: each row is an array of fields (max 3 per row)
  const rows = ref([])
  const selectedFieldId = ref(null)

  // Flatten rows to get all fields (for backward compatibility)
  const fields = computed(() => {
    return rows.value.flatMap(row => row.fields)
  })

  // Computed
  const selectedField = computed(() => {
    if (!selectedFieldId.value) return null
    return fields.value.find(f => f.id === selectedFieldId.value)
  })

  const previewUrl = computed(() => {
    const slug = formSlug.value || 'form-slug'
    return `yourclub.raceyaclub.local/forms/${slug}`
  })

  // Calculate columns based on number of fields in row (max 2 columns)
  const getColumnSize = (fieldCount) => {
    switch (fieldCount) {
      case 1: return 12
      case 2: return 6
      default: return 12
    }
  }

  // Update columns for all fields in a row
  const updateRowColumns = (rowIndex) => {
    const row = rows.value[rowIndex]
    if (!row) return

    const columnSize = getColumnSize(row.fields.length)
    row.fields.forEach(field => {
      field.columns = columnSize
    })
  }

  // Add field to a new row at the end
  const addField = (type, rowIndex = null) => {
    const newField = createDefaultField(type)

    if (rowIndex !== null && rowIndex >= 0 && rowIndex <= rows.value.length) {
      // Insert new row at specific position
      rows.value.splice(rowIndex, 0, {
        id: `row_${Date.now()}`,
        fields: [newField],
        description: ''
      })
    } else {
      // Add new row at end
      rows.value.push({
        id: `row_${Date.now()}`,
        fields: [newField],
        description: ''
      })
    }

    // Auto-select the newly added field
    selectedFieldId.value = newField.id
  }

  // Add field to existing row (left or right of existing field)
  const addFieldToRow = (type, rowIndex, position = 'right', fieldIndex = null) => {
    const row = rows.value[rowIndex]
    if (!row || row.fields.length >= 2) return false // Max 2 fields per row

    const newField = createDefaultField(type)

    if (fieldIndex !== null) {
      // Insert at specific position relative to field
      const insertIndex = position === 'left' ? fieldIndex : fieldIndex + 1
      row.fields.splice(insertIndex, 0, newField)
    } else {
      // Add at end of row
      row.fields.push(newField)
    }

    // Update columns for all fields in this row
    updateRowColumns(rowIndex)

    // Auto-select the newly added field
    selectedFieldId.value = newField.id
    return true
  }

  // Move field within same row or to different row
  const moveFieldInRow = (fromRowIndex, fromFieldIndex, toRowIndex, toPosition, toFieldIndex = null) => {
    const fromRow = rows.value[fromRowIndex]
    if (!fromRow || !fromRow.fields[fromFieldIndex]) return

    // Get the field to move
    const movedField = fromRow.fields[fromFieldIndex]

    // Handle same row reordering
    if (fromRowIndex === toRowIndex && toPosition !== 'center') {
      // Remove from current position
      fromRow.fields.splice(fromFieldIndex, 1)

      // Calculate new insert position
      let insertIndex = toFieldIndex !== null ? toFieldIndex : fromRow.fields.length
      if (toPosition === 'right') insertIndex++
      // Adjust if we removed from before the insert point
      if (fromFieldIndex < insertIndex) insertIndex--

      fromRow.fields.splice(insertIndex, 0, movedField)
      updateRowColumns(fromRowIndex)
      return
    }

    // Different row or creating new row (center position)
    // First, remove from source
    fromRow.fields.splice(fromFieldIndex, 1)

    // Track if source row was removed
    let sourceRowRemoved = false
    let adjustedToRowIndex = toRowIndex

    // If source row is now empty, remove it
    if (fromRow.fields.length === 0) {
      rows.value.splice(fromRowIndex, 1)
      sourceRowRemoved = true
      // Adjust toRowIndex if it was after the removed row
      if (toRowIndex > fromRowIndex) {
        adjustedToRowIndex--
      }
    } else {
      updateRowColumns(fromRowIndex)
    }

    // Determine where to insert
    if (toPosition === 'center') {
      // Create new row
      const insertRowIndex = sourceRowRemoved && toRowIndex > fromRowIndex
        ? adjustedToRowIndex + 1
        : toRowIndex + 1
      rows.value.splice(insertRowIndex, 0, {
        id: `row_${Date.now()}`,
        fields: [movedField],
        description: ''
      })
    } else {
      // Add to existing row
      const toRow = rows.value[adjustedToRowIndex]
      if (toRow && toRow.fields.length < 2) {
        let insertIndex = toFieldIndex !== null ? toFieldIndex : toRow.fields.length
        if (toPosition === 'right') insertIndex++
        // Make sure we don't go out of bounds
        insertIndex = Math.min(insertIndex, toRow.fields.length)
        toRow.fields.splice(insertIndex, 0, movedField)
        updateRowColumns(adjustedToRowIndex)
      } else {
        // Target row is full or doesn't exist, create new row
        rows.value.splice(adjustedToRowIndex + 1, 0, {
          id: `row_${Date.now()}`,
          fields: [movedField],
          description: ''
        })
      }
    }
  }

  const updateField = (id, changes) => {
    for (const row of rows.value) {
      const fieldIndex = row.fields.findIndex(f => f.id === id)
      if (fieldIndex !== -1) {
        row.fields[fieldIndex] = { ...row.fields[fieldIndex], ...changes }
        return
      }
    }
  }

  const deleteField = (id) => {
    for (let rowIndex = 0; rowIndex < rows.value.length; rowIndex++) {
      const row = rows.value[rowIndex]
      const fieldIndex = row.fields.findIndex(f => f.id === id)

      if (fieldIndex !== -1) {
        row.fields.splice(fieldIndex, 1)

        // If row is now empty, remove it
        if (row.fields.length === 0) {
          rows.value.splice(rowIndex, 1)
        } else {
          // Update columns for remaining fields
          updateRowColumns(rowIndex)
        }

        // Clear selection if deleted field was selected
        if (selectedFieldId.value === id) {
          selectedFieldId.value = null
        }
        return
      }
    }
  }

  const selectField = (id) => {
    selectedFieldId.value = id
  }

  const deselectField = () => {
    selectedFieldId.value = null
  }

  // Reorder rows
  const reorderRows = (oldIndex, newIndex) => {
    const row = rows.value.splice(oldIndex, 1)[0]
    rows.value.splice(newIndex, 0, row)
  }

  // Update row description
  const updateRowDescription = (rowIndex, description) => {
    const row = rows.value[rowIndex]
    if (row) {
      row.description = description
    }
  }

  // Find field location
  const findFieldLocation = (fieldId) => {
    for (let rowIndex = 0; rowIndex < rows.value.length; rowIndex++) {
      const fieldIndex = rows.value[rowIndex].fields.findIndex(f => f.id === fieldId)
      if (fieldIndex !== -1) {
        return { rowIndex, fieldIndex }
      }
    }
    return null
  }

  // Check if can add field to row
  const canAddToRow = (rowIndex) => {
    const row = rows.value[rowIndex]
    return row && row.fields.length < 3
  }

  const saveForm = () => {
    // Validate
    if (!formName.value || !formSlug.value) {
      return {
        success: false,
        error: 'Form name and slug are required'
      }
    }

    // Check if all fields have label
    const invalidFields = fields.value.filter(f => !f.label)
    if (invalidFields.length > 0) {
      return {
        success: false,
        error: 'All fields must have a label'
      }
    }

    // Prepare form data
    const formData = {
      name: formName.value,
      slug: formSlug.value,
      rows: rows.value,
      created_at: new Date().toISOString()
    }

    // Save to localStorage for now (replace with API call later)
    try {
      const savedForms = JSON.parse(localStorage.getItem('forms') || '[]')
      savedForms.push(formData)
      localStorage.setItem('forms', JSON.stringify(savedForms))

      return {
        success: true,
        data: formData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Auto-generate slug from name
  const generateSlug = () => {
    if (formName.value && !formSlug.value) {
      formSlug.value = formName.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
  }

  return {
    // State
    formName,
    formSlug,
    rows,
    fields, // Computed flat list for compatibility
    selectedFieldId,

    // Computed
    selectedField,
    previewUrl,

    // Methods
    addField,
    addFieldToRow,
    moveFieldInRow,
    updateField,
    deleteField,
    selectField,
    deselectField,
    reorderRows,
    updateRowDescription,
    findFieldLocation,
    canAddToRow,
    saveForm,
    generateSlug
  }
}
