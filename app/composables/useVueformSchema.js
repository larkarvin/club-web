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

            // Build VueForm element config
            const elementConfig = {
                type: field.type,
                label: field.label || undefined,
                placeholder: field.placeholder || undefined,
                description: field.description || undefined,
                columns: field.columns && field.columns < 12 ? field.columns : undefined,
                disabledAfterSubmission: field.disabledAfterSubmission || undefined,
                rules: rules.length > 0 ? rules.join('|') : undefined,
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

    // Formatted JSON for display
    const schemaFormatted = computed(() => {
        return JSON.stringify(schema.value, null, 2)
    })

    return {
        schema,
        schemaFormatted
    }
}
