import { reactive } from 'vue'

export function useFormSubmit<T extends Record<string, any>>(
    form: T,
    schema: Record<string, ((value: any) => true | string) | (() => (value: any) => true | string)>
) {
    const errors = reactive<Record<string, string>>({})

    // Validate all fields
    function validate() {
        const newErrors: Record<string, string> = {}

        for (const key in schema) {
            let validator = schema[key]

            // If validator is a function that returns a function, call it first
            if (typeof validator === 'function' && validator.length === 0) {
                validator = (validator as () => (value: any) => true | string)()
            }

            const result = (validator as (value: any) => true | string)(form[key])
            if (result !== true) {
                newErrors[key] = result as string
            }
        }

        // Clear previous errors and assign new
        for (const key in errors) delete errors[key]
        Object.assign(errors, newErrors)

        return Object.keys(newErrors).length === 0
    }

    // Submit wrapper
    async function submit(callback: () => Promise<void>) {
        if (!validate()) return

        try {
            await callback()
        } catch (err) {
            console.error('Form submission error:', err)
        }
    }

    return { errors, submit, validate }
}
