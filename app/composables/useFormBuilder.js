// composables/useFormBuilder.js
import { ref, computed } from 'vue'
import { useFieldRegistry } from './useFieldRegistry'

export function useFormBuilder() {
  const { createDefaultField } = useFieldRegistry()

  // Form state
  const formName = ref('')
  const formSlug = ref('')
  const fields = ref([])
  const selectedFieldId = ref(null)

  // Pages state (synced with API)
  const pages = ref([])
  const currentPageId = ref(null)

  // Computed
  const selectedField = computed(() => {
    if (!selectedFieldId.value) return null
    return fields.value.find(f => f.id === selectedFieldId.value)
  })

  const previewUrl = computed(() => {
    const slug = formSlug.value || 'form-slug'
    return `yourclub.raceyaclub.local/forms/${slug}`
  })

  const currentPage = computed(() => {
    if (!currentPageId.value && pages.value.length > 0) {
      return pages.value[0]
    }
    return pages.value.find(p => p.id === currentPageId.value) || pages.value[0] || null
  })

  // Fields filtered by current page
  const currentPageFields = computed(() => {
    const pageId = currentPageId.value || (pages.value[0]?.id)
    return fields.value.filter(f => f.pageId === pageId)
  })

  // Get field count for a specific page
  const getFieldCount = (pageId) => {
    return fields.value.filter(f => f.pageId === pageId).length
  }

  // Methods
  const addField = (type, index = null) => {
    const pageId = currentPageId.value || (pages.value[0]?.id)
    const newField = {
      ...createDefaultField(type),
      pageId: pageId  // Assign to current page
    }

    if (index !== null && index >= 0 && index <= fields.value.length) {
      // Insert at specific position
      fields.value.splice(index, 0, newField)
    } else {
      // Add to end
      fields.value.push(newField)
    }

    // Auto-select the newly added field
    selectedFieldId.value = newField.id

    // Return the new field for API calls
    return newField
  }

  // Page management methods (synced with API)
  // Note: These update local state. The component handles API calls.

  const addPageLocal = (newPage) => {
    pages.value.push(newPage)
    currentPageId.value = newPage.id
    return newPage
  }

  const updatePage = (pageId, changes) => {
    const index = pages.value.findIndex(p => p.id === pageId)
    if (index !== -1) {
      pages.value[index] = { ...pages.value[index], ...changes }
    }
  }

  const deletePageLocal = (pageId) => {
    // Don't delete if it's the only page
    if (pages.value.length <= 1) return false

    const index = pages.value.findIndex(p => p.id === pageId)
    if (index !== -1) {
      // Move fields from deleted page to first page (API handles this)
      const firstPageId = pages.value[0].id === pageId ? pages.value[1].id : pages.value[0].id
      fields.value.forEach(field => {
        if (field.pageId === pageId) {
          field.pageId = firstPageId
        }
      })

      // Remove the page
      pages.value.splice(index, 1)

      // Update current page if needed
      if (currentPageId.value === pageId) {
        currentPageId.value = pages.value[0].id
      }
      return true
    }
    return false
  }

  const selectPage = (pageId) => {
    currentPageId.value = pageId
    // Deselect field when switching pages
    selectedFieldId.value = null
  }

  const reorderPagesLocal = (newOrder) => {
    // Reorder based on new order array of IDs
    const reordered = newOrder.map(id => pages.value.find(p => p.id === id)).filter(Boolean)
    pages.value = reordered
  }

  const setPages = (newPages) => {
    if (newPages && newPages.length > 0) {
      pages.value = newPages
      currentPageId.value = newPages[0].id
    } else {
      pages.value = []
      currentPageId.value = null
    }
  }

  const updateField = (id, changes) => {
    const index = fields.value.findIndex(f => f.id === id)
    if (index !== -1) {
      fields.value[index] = { ...fields.value[index], ...changes }
    }
  }

  const deleteField = (id) => {
    const index = fields.value.findIndex(f => f.id === id)
    if (index !== -1) {
      fields.value.splice(index, 1)
      // Clear selection if deleted field was selected
      if (selectedFieldId.value === id) {
        selectedFieldId.value = null
      }
    }
  }

  const selectField = (id) => {
    selectedFieldId.value = id
  }

  const deselectField = () => {
    selectedFieldId.value = null
  }

  const reorderFields = (oldIndex, newIndex) => {
    const field = fields.value.splice(oldIndex, 1)[0]
    fields.value.splice(newIndex, 0, field)
  }

  const setFields = (newFields) => {
    fields.value = newFields
    selectedFieldId.value = null
  }

  const saveForm = () => {
    // Validate
    if (!formName.value || !formSlug.value) {
      return {
        success: false,
        error: 'Form name and slug are required'
      }
    }

    // Check if all fields have name and label
    const invalidFields = fields.value.filter(f => !f.name || !f.label)
    if (invalidFields.length > 0) {
      return {
        success: false,
        error: 'All fields must have a name and label'
      }
    }

    // Prepare form data
    const formData = {
      name: formName.value,
      slug: formSlug.value,
      fields: fields.value,
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
    fields,
    selectedFieldId,
    pages,
    currentPageId,

    // Computed
    selectedField,
    previewUrl,
    currentPage,
    currentPageFields,

    // Methods
    addField,
    updateField,
    deleteField,
    selectField,
    deselectField,
    reorderFields,
    setFields,
    saveForm,
    generateSlug,

    // Page methods
    addPageLocal,
    updatePage,
    deletePageLocal,
    selectPage,
    reorderPagesLocal,
    setPages,
    getFieldCount
  }
}