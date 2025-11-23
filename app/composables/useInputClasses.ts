import { computed } from 'vue'

interface Props {
    disabled?: boolean
    error?: string
    success?: string
}

export function useInputClasses(props: Props) {
    const base = 'h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden dark:text-white/90 dark:placeholder:text-white/30'

    const classes = computed(() => [
        base,
        props.disabled
            ? 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 cursor-not-allowed'
            : 'border-gray-300 bg-transparent dark:border-gray-700 dark:bg-gray-900 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10',
        props.error
            ? 'border-error-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-error-700 dark:focus:border-error-800'
            : '',
        props.success
            ? 'border-success-300 focus:border-success-300 focus:ring-3 focus:ring-success-500/10 dark:border-success-700 dark:focus:border-success-800'
            : ''
    ])

    return { classes }
}
