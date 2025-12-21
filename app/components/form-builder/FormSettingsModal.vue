<!-- app/components/form-builder/FormSettingsModal.vue -->
<template>
    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
        <div class="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 class="text-lg font-semibold text-black dark:text-white mb-4">
                Save Form
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to save this form?
            </p>
            <div class="flex justify-end gap-3">
                <button @click="showConfirmation = false"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-5 py-2.5 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    No
                </button>
                <button @click="confirmSaveForm"
                    class="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center font-medium text-white hover:bg-opacity-90">
                    Yes
                </button>
            </div>
        </div>
    </div>

    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal">
        <div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <h3 class="text-xl font-semibold text-black dark:text-white">
                    Form Settings
                </h3>
                <button v-if="showCancel" @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Form Title -->
            <BaseInput v-model="localSettings.title" label="Title" placeholder="Enter form title" required
                @input="handleTitleInput" />

            <!-- Slug -->
            <BaseInput v-model="localSettings.slug" label="Slug" placeholder="form-slug" required />

            <!-- URL Preview -->
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                URL: {{ computedPreviewUrl }}
            </p>

            <!-- Description -->
            <div class="mb-4">
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Description
                </label>
                <textarea v-model="localSettings.description" rows="3" placeholder="Enter form description (optional)"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
            </div>

            <!-- Processing Fee -->
            <div class="mb-4">
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Processing Fee
                </label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input type="number" v-model.number="localSettings.processingFee" step="0.01" min="0"
                        placeholder="0.00"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent pl-8 pr-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Additional fee charged on form submission
                </p>
            </div>

            <!-- Enabled/Disabled Toggle -->
            <div class="mb-4 flex items-center justify-between py-3 border-t border-b border-stroke dark:border-strokedark">
                <div>
                    <label class="text-sm font-medium text-black dark:text-white">
                        Form Enabled
                    </label>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Allow new submissions
                    </p>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" v-model="localSettings.enabled" class="peer sr-only" />
                    <div class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                </label>
            </div>

            <!-- Allow Submission Until -->
            <div class="mb-6">
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Allow Submissions Until
                </label>
                <input type="datetime-local" v-model="localSettings.submissionDeadline"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty for no deadline
                </p>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                <button v-if="showCancel" @click="closeModal"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    Cancel
                </button>
                <button @click="handleSave" :disabled="!canSave"
                    class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    {{ saveButtonText }}
                </button>
                <button @click="handleSaveForm" :disabled="!canSave"
                    class="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Form
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '~/components/forms/BaseInput.vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    settings: {
        type: Object,
        default: () => ({
            title: '',
            slug: '',
            description: '',
            processingFee: 0,
            enabled: true,
            submissionDeadline: null
        })
    },
    previewUrl: {
        type: String,
        default: ''
    },
    showCancel: {
        type: Boolean,
        default: true
    },
    saveButtonText: {
        type: String,
        default: 'Save'
    }
})

const emit = defineEmits(['close', 'save', 'save-form'])

// Confirmation modal state
const showConfirmation = ref(false)

// Local copy for editing
const localSettings = ref({
    title: props.settings.title || '',
    slug: props.settings.slug || '',
    description: props.settings.description || '',
    processingFee: props.settings.processingFee || 0,
    enabled: props.settings.enabled !== false,
    submissionDeadline: props.settings.submissionDeadline || null
})

// Watch for external changes
watch(() => props.settings, (newSettings) => {
    localSettings.value = {
        title: newSettings.title || '',
        slug: newSettings.slug || '',
        description: newSettings.description || '',
        processingFee: newSettings.processingFee || 0,
        enabled: newSettings.enabled !== false,
        submissionDeadline: newSettings.submissionDeadline || null
    }
}, { deep: true })

// Computed preview URL
const computedPreviewUrl = computed(() => {
    if (props.previewUrl) return props.previewUrl
    return `/forms/${localSettings.value.slug || 'form-slug'}`
})

// Auto-generate slug from title - always update slug as title is typed
const handleTitleInput = () => {
    localSettings.value.slug = slugify(localSettings.value.title)
}

// Slugify helper
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// Can save if title and slug are filled
const canSave = computed(() => {
    return localSettings.value.title && localSettings.value.slug
})

// Handle save
const handleSave = () => {
    if (!canSave.value) return

    emit('save', { ...localSettings.value })
}

// Close modal
const closeModal = () => {
    if (props.showCancel) {
        emit('close')
    }
}

// Handle Save Form button click - show confirmation
const handleSaveForm = () => {
    if (!canSave.value) return
    showConfirmation.value = true
}

// Confirm save form - emit event with settings
const confirmSaveForm = () => {
    showConfirmation.value = false
    emit('save-form', { ...localSettings.value })
}
</script>
