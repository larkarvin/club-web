// composables/useFieldRegistry.js
export const FIELD_TYPES = {
  text: {
    id: 'text',
    label: 'Text Input',
    icon: '📝',
    defaultConfig: {
      type: 'text',
      label: 'Text Field',
      description: '',
      placeholder: 'Enter text...',
      required: false,
      disabledAfterSubmission: false,
      minLength: null,
      maxLength: null
    }
  },
  textarea: {
    id: 'textarea',
    label: 'Text Area',
    icon: '📄',
    defaultConfig: {
      type: 'textarea',
      label: 'Text Area',
      description: '',
      placeholder: 'Enter text...',
      required: false,
      disabledAfterSubmission: false,
      minLength: null,
      maxLength: null
    }
  },
  select: {
    id: 'select',
    label: 'Select Option',
    icon: '📋',
    defaultConfig: {
      type: 'select',
      label: 'Select Option',
      description: '',
      placeholder: 'Select an option...',
      required: false,
      disabledAfterSubmission: false,
      options: [
        { id: 'opt_1', value: 'option1', label: 'Option 1', price: 0 },
        { id: 'opt_2', value: 'option2', label: 'Option 2', price: 0 }
      ]
    }
  },
  email: {
    id: 'email',
    label: 'Email',
    icon: '📧',
    defaultConfig: {
      type: 'email',
      label: 'Email Address',
      description: '',
      placeholder: 'Enter email address...',
      required: false,
      disabledAfterSubmission: false
    }
  },
  phone: {
    id: 'phone',
    label: 'Phone Number',
    icon: '📞',
    defaultConfig: {
      type: 'phone',
      label: 'Phone Number',
      description: '',
      placeholder: 'Enter phone number...',
      required: false,
      disabledAfterSubmission: false
    }
  },
  number: {
    id: 'number',
    label: 'Number',
    icon: '🔢',
    defaultConfig: {
      type: 'number',
      label: 'Number',
      description: '',
      placeholder: 'Enter number...',
      required: false,
      disabledAfterSubmission: false,
      min: null,
      max: null,
      allowDecimal: false
    }
  }
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