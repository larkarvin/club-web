// composables/useVueformSchema.js
import { computed } from 'vue'

export function useVueformSchema(fields) {
    // Convert fields to VueForm schema format
    const schema = computed(() => {
        const result = {}

        fields.value.forEach((field, index) => {
            // Use field id as key to ensure uniqueness
            const fieldKey = `field_${index + 1}`

            // Build validation rules
            const rules = []
            if (field.required) rules.push('required')
            if (field.minLength) rules.push(`min:${field.minLength}`)
            if (field.maxLength) rules.push(`max:${field.maxLength}`)

            // Number field validation
            if (field.type === 'number') {
                if (field.min !== null && field.min !== undefined) rules.push(`min:${field.min}`)
                if (field.max !== null && field.max !== undefined) rules.push(`max:${field.max}`)
            }

            // Email validation
            if (field.type === 'email') {
                rules.push('email')
            }

            // Build VueForm element config
            const elementConfig = {
                type: mapFieldType(field.type),
                label: field.label || undefined,
                placeholder: field.placeholder || undefined,
                description: field.description || undefined,
                rules: rules.length > 0 ? rules.join('|') : undefined,
            }

            // Add disabledAfterSubmission if true
            if (field.disabledAfterSubmission) {
                elementConfig.disabled = {
                    afterSubmission: true
                }
            }

            // Handle select field options with price
            if (field.type === 'select' && field.options) {
                elementConfig.items = field.options.map(opt => ({
                    value: opt.value,
                    label: opt.label,
                    ...(opt.price > 0 ? { price: opt.price } : {})
                }))
            }

            // Handle number field specific properties
            if (field.type === 'number') {
                if (field.allowDecimal) {
                    elementConfig.step = 0.01
                }
                if (field.min !== null && field.min !== undefined) {
                    elementConfig.min = field.min
                }
                if (field.max !== null && field.max !== undefined) {
                    elementConfig.max = field.max
                }
            }

            // Handle textarea rows
            if (field.type === 'textarea') {
                elementConfig.rows = 4
            }

            // Remove undefined values
            Object.keys(elementConfig).forEach(key => {
                if (elementConfig[key] === undefined) {
                    delete elementConfig[key]
                }
            })

            result[fieldKey] = elementConfig
        })

        return result
    })

    // Map internal field types to VueForm types
    const mapFieldType = (type) => {
        const typeMap = {
            'text': 'text',
            'textarea': 'textarea',
            'email': 'text',  // VueForm uses text with email validation
            'phone': 'text',  // VueForm uses text for phone
            'number': 'text', // VueForm can use text with number input type
            'select': 'select'
        }
        return typeMap[type] || type
    }

    // Formatted JSON for display
    const schemaFormatted = computed(() => {
        return JSON.stringify(schema.value, null, 2)
    })

    return {
        schema,
        schemaFormatted
    }
}
