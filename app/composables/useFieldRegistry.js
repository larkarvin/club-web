// composables/useFieldRegistry.js
export const FIELD_TYPES = {
  text: {
    id: 'text',
    label: 'Text Input',
    icon: '📝',
    defaultConfig: {
      type: 'text',
      label: '',
      description: '',
      placeholder: '',
      required: false,
      disabledAfterSubmission: false,
      minLength: 3,
      maxLength: 100,
      columns: 12 // 12 = full width, 6 = half, 4 = third
    }
  }
  // Add more field types here in the future:
  // email: { ... },
  // number: { ... },
  // etc.
}

export function useFieldRegistry() {
  const getFieldType = (type) => {
    return FIELD_TYPES[type]
  }

  const createDefaultField = (type) => {
    const fieldType = FIELD_TYPES[type]
    if (!fieldType) {
      throw new Error(`Unknown field type: ${type}`)
    }

    return {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...fieldType.defaultConfig
    }
  }

  return {
    FIELD_TYPES,
    getFieldType,
    createDefaultField
  }
}