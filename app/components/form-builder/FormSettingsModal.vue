<!-- app/components/form-builder/FormSettingsModal.vue -->
<template>
    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="fixed inset-0 z-[9999999] flex items-center justify-center bg-black bg-opacity-50">
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

    <div v-if="isOpen" class="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal">
        <div class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark max-h-[90vh] overflow-y-auto">
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

            <!-- ========================== -->
            <!-- GENERAL SETTINGS -->
            <!-- ========================== -->
            <div class="mb-6">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    General
                </h4>

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

                <!-- Submit Button Text -->
                <BaseInput v-model="localSettings.submitButtonText" label="Submit Button Text" placeholder="Submit" />
            </div>

            <!-- ========================== -->
            <!-- ACCESS CONTROL -->
            <!-- ========================== -->
            <div class="mb-6 pt-4 border-t border-stroke dark:border-strokedark">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Access Control
                </h4>

                <!-- Enabled/Disabled Toggle -->
                <div class="mb-4 flex items-center justify-between py-3">
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

                <!-- Members Only Toggle -->
                <div class="mb-4 flex items-center justify-between py-3">
                    <div>
                        <label class="text-sm font-medium text-black dark:text-white">
                            Members Only
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Require login to submit
                        </p>
                    </div>
                    <label class="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" v-model="localSettings.membersOnly" class="peer sr-only" />
                        <div class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                    </label>
                </div>

                <!-- Allow Non-Members Toggle (only show if members only is enabled) -->
                <div v-if="localSettings.membersOnly" class="mb-4 flex items-center justify-between py-3 pl-6 border-l-2 border-primary/30">
                    <div>
                        <label class="text-sm font-medium text-black dark:text-white">
                            Allow Non-Members
                        </label>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Allow guests to submit without membership
                        </p>
                    </div>
                    <label class="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" v-model="localSettings.allowNonMembers" class="peer sr-only" />
                        <div class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                    </label>
                </div>

                <!-- Allow Submission Until -->
                <div class="mb-4">
                    <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Submission Deadline
                    </label>
                    <input type="datetime-local" v-model="localSettings.submissionDeadline"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave empty for no deadline
                    </p>
                </div>
            </div>

            <!-- ========================== -->
            <!-- PAYMENT SETTINGS -->
            <!-- ========================== -->
            <div class="mb-6 pt-4 border-t border-stroke dark:border-strokedark">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Payment
                </h4>

                <!-- Currency -->
                <div class="mb-4">
                    <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Currency
                    </label>
                    <select v-model="localSettings.currency"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                        <option value="USD">USD - US Dollar</option>
                        <option value="PHP">PHP - Philippine Peso</option>
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                    </select>
                </div>

                <!-- Processing Fee -->
                <div class="mb-4">
                    <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Processing Fee
                    </label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{{ currencySymbol }}</span>
                        <input type="number" v-model.number="localSettings.processingFee" step="0.01" min="0"
                            placeholder="0.00"
                            class="w-full rounded border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Additional fee charged on form submission
                    </p>
                </div>

                <!-- Payment Gateway -->
                <div class="mb-4">
                    <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        Payment Gateway
                    </label>
                    <select v-model="localSettings.paymentGateway"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
                        <option value="">No payment required</option>
                        <option v-if="localSettings.currency === 'PHP'" value="xendit_ph">Xendit PH Checkout</option>
                        <option v-if="localSettings.currency === 'IDR'" value="xendit_id">Xendit ID Checkout</option>
                        <option v-if="localSettings.currency === 'PHP' || localSettings.currency === 'USD'" value="paypal">PayPal</option>
                    </select>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select a payment gateway to collect payments
                    </p>
                </div>
            </div>

            <!-- ========================== -->
            <!-- NOTIFICATIONS -->
            <!-- ========================== -->
            <div class="mb-6 pt-4 border-t border-stroke dark:border-strokedark">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Notifications
                </h4>

                <!-- CC Emails -->
                <div class="mb-4">
                    <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                        CC Emails
                    </label>
                    <textarea v-model="localSettings.ccEmails" rows="3"
                        placeholder="Enter email addresses (one per line)"
                        class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        These email addresses will receive a copy of each submission
                    </p>
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex justify-between pt-4 border-t border-stroke dark:border-strokedark">
                <!-- Cancel on the left -->
                <button v-if="showCancel" @click="closeModal"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    Cancel
                </button>
                <div v-else></div>

                <!-- Save buttons on the right -->
                <div class="flex gap-3">
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
            currency: 'USD',
            paymentGateway: '',
            enabled: true,
            membersOnly: false,
            allowNonMembers: true,
            submissionDeadline: null,
            submitButtonText: 'Submit',
            ccEmails: ''
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
    currency: props.settings.currency || 'USD',
    paymentGateway: props.settings.paymentGateway || '',
    enabled: props.settings.enabled !== false,
    membersOnly: props.settings.membersOnly || false,
    allowNonMembers: props.settings.allowNonMembers !== false,
    submissionDeadline: props.settings.submissionDeadline || null,
    submitButtonText: props.settings.submitButtonText || 'Submit',
    ccEmails: props.settings.ccEmails || ''
})

// Watch for external changes
watch(() => props.settings, (newSettings) => {
    localSettings.value = {
        title: newSettings.title || '',
        slug: newSettings.slug || '',
        description: newSettings.description || '',
        processingFee: newSettings.processingFee || 0,
        currency: newSettings.currency || 'USD',
        paymentGateway: newSettings.paymentGateway || '',
        enabled: newSettings.enabled !== false,
        membersOnly: newSettings.membersOnly || false,
        allowNonMembers: newSettings.allowNonMembers !== false,
        submissionDeadline: newSettings.submissionDeadline || null,
        submitButtonText: newSettings.submitButtonText || 'Submit',
        ccEmails: newSettings.ccEmails || ''
    }
}, { deep: true })

// Reset payment gateway when currency changes if gateway is not compatible
watch(() => localSettings.value.currency, (newCurrency) => {
    const gateway = localSettings.value.paymentGateway
    if (gateway) {
        // Check if current gateway is valid for new currency
        const validGateways = {
            'PHP': ['xendit_ph', 'paypal'],
            'IDR': ['xendit_id'],
            'USD': ['paypal']
        }
        if (!validGateways[newCurrency]?.includes(gateway)) {
            localSettings.value.paymentGateway = ''
        }
    }
})

// Currency symbol
const currencySymbol = computed(() => {
    switch (localSettings.value.currency) {
        case 'PHP': return '₱'
        case 'IDR': return 'Rp'
        case 'USD':
        default: return '$'
    }
})

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
