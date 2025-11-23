// composables/useValidation.ts
import { helpers, required, minLength, maxLength, email, sameAs as vuelidateSameAs } from '@vuelidate/validators'

export function useValidation() {

    /**
     * Password validation rules
     * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol
     */
    const passwordRules = (value: string) => {
        const hasMinLength = value.length >= 8
        const hasUppercase = /[A-Z]/.test(value)
        const hasLowercase = /[a-z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value)

        return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol
    }

    const VALIDATIONS = {
        required: (label: string) =>
            helpers.withMessage(() => `${label} is required`, required),

        email: () =>
            helpers.withMessage(() => `Must be a valid email address`, email),

        minLength: (label: string, min: number) =>
            helpers.withMessage(
                ({ $params }) => `${label} must be at least ${$params.min} characters`,
                minLength(min)
            ),

        maxLength: (label: string, max: number) =>
            helpers.withMessage(
                ({ $params }) => `${label} must be no more than ${$params.max} characters`,
                maxLength(max)
            ),

        alphanumeric: (label: string) =>
            helpers.withMessage(
                () => `${label} must not contain special characters`,
                (value: string) => /^[a-zA-Z0-9 ]*$/.test(value)
            ),

        password: () =>
            helpers.withMessage(
                () => `Password must contain uppercase, lowercase, number, and symbol`,
                passwordRules
            ),

        sameAs: (label: string, targetValue: any) =>
            helpers.withMessage(`${label} does not match`, vuelidateSameAs(targetValue)),
    } as const

    const PASSWORD_VALIDATION_STRICT = {
        required: VALIDATIONS.required('Password'),
        minLength: VALIDATIONS.minLength('Password', 8),
        password: VALIDATIONS.password(),
    }

    const PASSWORD_VALIDATION = {
        required: VALIDATIONS.required('Password'),
        minLength: VALIDATIONS.minLength('Password', 8),
    }

    return {
        VALIDATIONS,
        PASSWORD_VALIDATION,
        PASSWORD_VALIDATION_STRICT,
    }
}
