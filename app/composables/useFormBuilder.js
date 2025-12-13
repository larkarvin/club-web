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

  // Computed
  const selectedField = computed(() => {
    if (!selectedFieldId.value) return null
    return fields.value.find(f => f.id === selectedFieldId.value)
  })

  const previewUrl = computed(() => {
    const slug = formSlug.value || 'form-slug'
    return `yourclub.raceyaclub.local/forms/${slug}`
  })

  // Methods
  const addField = (type, index = null) => {
    const newField = createDefaultField(type)
    
    if (index !== null && index >= 0 && index <= fields.value.length) {
      // Insert at specific position
      fields.value.splice(index, 0, newField)
    } else {
      // Add to end
      fields.value.push(newField)
    }
    
    // Auto-select the newly added field
    selectedFieldId.value = newField.id
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
    
    // Computed
    selectedField,
    previewUrl,
    
    // Methods
    addField,
    updateField,
    deleteField,
    selectField,
    deselectField,
    reorderFields,
    saveForm,
    generateSlug
  }
}