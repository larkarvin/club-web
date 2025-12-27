<!-- pages/forms/[id]/fields.vue -->
<template>
    <admin-layout @click="handleLayoutClick">
        <page-breadcrumb pageTitle="Edit Form Fields" />

        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>

        <template v-else>
            <!-- Top Bar: Inline Editable Name + Settings Button -->
            <FormBuilderTopBar v-model="formName" @open-settings="isSettingsOpen = true" />

            <!-- Form Settings Modal -->
            <FormSettingsModal
                :is-open="isSettingsOpen"
                :settings="formSettings"
                :preview-url="previewUrl"
                :show-cancel="true"
                save-button-text="Save Settings"
                @close="isSettingsOpen = false"
                @save="handleSettingsSave"
                @save-form="handleSaveFormFromSettings"
            />

            <!-- Form Preview Modal (Wizard) -->
            <FormPreviewModal
                :is-open="isPreviewModalOpen"
                :pages="pages"
                :fields="fields"
                @close="isPreviewModalOpen = false"
            />

            <!-- API Payload Preview Modal -->
            <div v-if="isSchemaModalOpen" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50"
                @click.self="isSchemaModalOpen = false">
                <div class="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark">
                        <h3 class="text-xl font-semibold text-black dark:text-white">API Payload Preview</h3>
                        <button @click="isSchemaModalOpen = false"
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 overflow-auto flex-1">
                        <pre
                            class="bg-gray-100 dark:bg-meta-4 p-4 rounded-lg text-sm overflow-x-auto"><code>{{ apiPayloadFormatted }}</code></pre>
                    </div>

                    <!-- Modal Footer -->
                    <div class="flex justify-end gap-3 p-6 border-t border-stroke dark:border-strokedark">
                        <button @click="copyPayload"
                            class="inline-flex items-center justify-center gap-2 rounded-md border border-stroke px-5 py-2.5 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </button>
                        <button @click="isSchemaModalOpen = false"
                            class="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2.5 text-center font-medium text-white hover:bg-brand-600">
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <!-- Form Builder Layout -->
            <FormBuilderLayout>
                <!-- Left: Page Manager + Component Library -->
                <template #library>
                    <!-- Show PageManager only when multiple pages exist -->
                    <PageManager
                        v-if="pages.length > 1"
                        :pages="pages"
                        :current-page-id="currentPageId"
                        :get-field-count="getFieldCount"
                        @add-page="handleAddPage"
                        @select-page="selectPage"
                        @delete-page="handleDeletePage"
                        @update-page="handleUpdatePageFromManager"
                        @reorder-pages="handleReorderPages"
                    />
                    <!-- Show "Enable Wizard" button when single page -->
                    <div v-else class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-4">
                        <button
                            @click="handleAddPage"
                            class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            Enable Multi-Step Wizard
                        </button>
                    </div>
                    <ComponentLibrary @add-field="handleAddField" />
                </template>

                <!-- Center: Canvas (shows only current page fields) -->
                <template #canvas>
                    <FormCanvas
                        :fields="pages.length > 1 ? currentPageFields : fields"
                        :selected-id="selectedFieldId"
                        :current-page="pages.length > 1 ? currentPage : null"
                        :total-pages="pages.length"
                        @select="selectField"
                        @delete="handleDeleteField"
                        @update:fields="handleFieldsReorder"
                    />
                </template>

                <!-- Right: Properties Panel -->
                <template #properties>
                    <PropertiesPanel
                        :field="selectedField"
                        :page="pages.length > 1 ? currentPage : null"
                        :page-field-count="currentPageFields.length"
                        @update="handleUpdateField"
                        @delete="handleDeleteSelectedField"
                        @update-page="handleUpdatePage"
                    />
                </template>
            </FormBuilderLayout>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center mt-6">
                <!-- Cancel Button (Left) -->
                <button @click="handleCancel"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    Back to Forms
                </button>

                <!-- Right Buttons -->
                <div class="flex items-center gap-3">
                    <!-- Saving indicator -->
                    <span v-if="isSaving" class="text-sm text-gray-500 flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </span>

                    <!-- Preview Wizard Button (only show when multiple pages) -->
                    <button
                        v-if="pages.length > 1"
                        @click="isPreviewModalOpen = true"
                        class="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Wizard
                    </button>

                    <!-- Preview Payload Button -->
                    <button @click="isSchemaModalOpen = true"
                        class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Preview Payload
                    </button>
                </div>
            </div>
        </template>
    </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import AdminLayout from '~/components/layout/AdminLayout.vue'
import PageBreadcrumb from '~/components/common/PageBreadcrumb.vue'
import FormBuilderTopBar from '~/components/form-builder/FormBuilderTopBar.vue'
import FormSettingsModal from '~/components/form-builder/FormSettingsModal.vue'
import FormBuilderLayout from '~/components/form-builder/layout/FormBuilderLayout.vue'
import ComponentLibrary from '~/components/form-builder/library/ComponentLibrary.vue'
import FormCanvas from '~/components/form-builder/canvas/FormCanvas.vue'
import PropertiesPanel from '~/components/form-builder/properties/PropertiesPanel.vue'
import PageManager from '~/components/form-builder/pages/PageManager.vue'
import FormPreviewModal from '~/components/form-builder/preview/FormPreviewModal.vue'
import { useFormBuilder } from '~/composables/useFormBuilder'
import { useVueformSchema } from '~/composables/useVueformSchema'
import { useApi } from '~/composables/useApi'

definePageMeta({ middleware: ['auth'] })

const router = useRouter()
const route = useRoute()
const { forms, fields: fieldsApi, pages: pagesApi } = useApi()

// Get form ID from route
const formId = computed(() => route.params.id)

// Loading states
const isLoading = ref(true)
const isSaving = ref(false)

// Form builder composable
const {
    fields,
    selectedFieldId,
    selectedField,
    addField,
    updateField,
    deleteField,
    selectField,
    deselectField,
    setFields,
    // Page-related (synced with API)
    pages,
    currentPageId,
    currentPage,
    currentPageFields,
    addPageLocal,
    updatePage,
    deletePageLocal,
    selectPage,
    reorderPagesLocal,
    setPages,
    getFieldCount
} = useFormBuilder()

// Form settings
const formSettings = ref({
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

// Computed form name for top bar
const formName = computed({
    get: () => formSettings.value.title,
    set: (val) => { formSettings.value.title = val }
})

// Preview URL
const previewUrl = computed(() => `/forms/${formSettings.value.slug || 'form-slug'}`)

// VueForm schema generation
const { schema: vueformSchema } = useVueformSchema(fields)

// API payload computed property
const apiPayload = computed(() => ({
    title: formSettings.value.title,
    slug: formSettings.value.slug,
    description: formSettings.value.description,
    processingFee: formSettings.value.processingFee,
    currency: formSettings.value.currency,
    paymentGateway: formSettings.value.paymentGateway,
    enabled: formSettings.value.enabled,
    membersOnly: formSettings.value.membersOnly,
    allowNonMembers: formSettings.value.allowNonMembers,
    submissionDeadline: formSettings.value.submissionDeadline,
    submitButtonText: formSettings.value.submitButtonText,
    ccEmails: formSettings.value.ccEmails,
    schema: vueformSchema.value,
    fields: fields.value
}))

const apiPayloadFormatted = computed(() => JSON.stringify(apiPayload.value, null, 2))

// Settings modal state
const isSettingsOpen = ref(false)

// Schema modal state
const isSchemaModalOpen = ref(false)

// Preview modal state (wizard preview)
const isPreviewModalOpen = ref(false)

// Load form data on mount
onMounted(async () => {
    await loadForm()
})

// Map API page to local format
const mapApiPageToLocal = (apiPage) => ({
    id: apiPage.id,
    title: apiPage.title || '',
    description: apiPage.description || '',
    sortOrder: apiPage.sort_order
})

// Map API field (snake_case) to local field format (camelCase)
const mapApiFieldToLocal = (apiField, defaultPageId = null) => ({
    id: apiField.id,
    type: apiField.type,
    label: apiField.label || '',
    placeholder: apiField.placeholder || '',
    description: apiField.description || '',
    required: apiField.required || false,
    minLength: apiField.min || null,
    maxLength: apiField.max || null,
    min: apiField.min || null,
    max: apiField.max || null,
    allowDecimal: apiField.allow_decimal || false,
    disabledAfterSubmission: apiField.disabled_after_submission || false,
    pageId: apiField.page_id || defaultPageId,  // Assign to page
    options: apiField.options?.map(opt => ({
        id: opt.id,
        value: opt.value,
        label: opt.label,
        price: opt.price || 0
    })) || []
})

// Map local field to API format (snake_case for API)
// isNew: true for creating new fields, false for updating existing ones
const mapLocalFieldToApi = (localField, isNew = false) => {
    const mapped = {
        page_id: localField.pageId,
        type: localField.type,
        label: localField.label,
        placeholder: localField.placeholder,
        description: localField.description,
        required: localField.required,
        min: localField.type === 'number' ? localField.min : localField.minLength,
        max: localField.type === 'number' ? localField.max : localField.maxLength,
        allow_decimal: localField.allowDecimal,
        disabled_after_submission: localField.disabledAfterSubmission,
        options: localField.options?.map(opt => ({
            option_key: String(opt.id || opt.value),
            value: opt.value,
            label: opt.label,
            price: opt.price || 0
        })) || []
    }

    // Only include field_key for new fields
    if (isNew) {
        mapped.field_key = String(localField.id)
    }

    return mapped
}

// Load form from API
const loadForm = async () => {
    isLoading.value = true

    try {
        const response = await forms.get(formId.value)
        console.log('API Response:', response)

        // Handle both wrapped and unwrapped responses
        const formData = response.data || response

        console.log('Form Data:', formData)

        // Set form settings (API returns snake_case)
        formSettings.value = {
            title: formData.title || '',
            slug: formData.slug || '',
            description: formData.description || '',
            processingFee: formData.processing_fee || 0,
            currency: formData.currency || 'USD',
            paymentGateway: formData.payment_gateway || '',
            enabled: formData.enabled !== false,
            membersOnly: formData.members_only || false,
            allowNonMembers: formData.allow_non_members !== false,
            submissionDeadline: formData.submission_deadline || null,
            submitButtonText: formData.submit_button_text || 'Submit',
            ccEmails: formData.cc_emails || ''
        }

        // Set pages from API
        if (formData.pages && Array.isArray(formData.pages)) {
            const mappedPages = formData.pages
                .filter(p => p && p.id)
                .map(mapApiPageToLocal)
            console.log('Mapped Pages:', mappedPages)
            setPages(mappedPages)
        } else {
            console.log('No pages found in response')
            setPages([])
        }

        // Get default page ID for fields without a page
        const defaultPageId = pages.value.length > 0 ? pages.value[0].id : null

        // Set fields (map from API format to local format)
        if (formData.fields && Array.isArray(formData.fields)) {
            const mappedFields = formData.fields
                .filter(f => f && f.id) // Filter out null/undefined fields
                .map(f => mapApiFieldToLocal(f, defaultPageId))
            console.log('Mapped Fields:', mappedFields)
            setFields(mappedFields)
        } else {
            console.log('No fields found in response')
            setFields([])
        }
    } catch (error) {
        console.error('Error loading form:', error)
        toast.error('Failed to load form')
        router.push('/forms')
    } finally {
        isLoading.value = false
    }
}

// Copy payload to clipboard
const copyPayload = async () => {
    try {
        await navigator.clipboard.writeText(apiPayloadFormatted.value)
        toast.success('Payload copied to clipboard!')
    } catch (err) {
        toast.error('Failed to copy payload')
    }
}

// Handle settings save via API
const handleSettingsSave = async (settings) => {
    isSaving.value = true

    try {
        // Map to API format (snake_case)
        const apiSettings = {
            title: settings.title,
            slug: settings.slug,
            description: settings.description,
            processing_fee: settings.processingFee,
            enabled: settings.enabled,
            submission_deadline: settings.submissionDeadline
        }
        await forms.updateSettings(formId.value, apiSettings)
        formSettings.value = { ...settings }
        isSettingsOpen.value = false
        toast.success('Form settings updated!')
    } catch (error) {
        console.error('Error saving settings:', error)
        toast.error('Failed to save settings')
    } finally {
        isSaving.value = false
    }
}

// Handle Save Form from settings modal (after confirmation)
const handleSaveFormFromSettings = async (settings) => {
    formSettings.value = { ...settings }
    await handleSaveForm()
}

// Add field via API
const handleAddField = async (fieldType) => {
    const newField = addField(fieldType)
    const apiField = mapLocalFieldToApi(newField, true) // isNew = true

    try {
        const response = await fieldsApi.create(formId.value, apiField)
        // Update local field with server response (use server-generated ID and page_id)
        if (response.data?.id) {
            updateField(newField.id, {
                ...newField,
                id: response.data.id,
                pageId: response.data.page_id || newField.pageId
            })
        }
    } catch (error) {
        console.error('Error adding field:', error)
        toast.error('Failed to add field')
        // Remove the field if API call failed
        deleteField(newField.id)
    }
}

// Update field via API (debounced)
let updateTimeout = null
const handleUpdateField = async (updatedField) => {
    if (!selectedFieldId.value || !updatedField?.id) return

    const fieldId = updatedField.id

    // Update local state immediately
    updateField(selectedFieldId.value, updatedField)

    // Debounce API call
    if (updateTimeout) clearTimeout(updateTimeout)
    updateTimeout = setTimeout(async () => {
        try {
            const apiField = mapLocalFieldToApi(updatedField)
            await fieldsApi.update(formId.value, fieldId, apiField)
            toast.success('Field updated')
        } catch (error) {
            console.error('Error updating field:', error)
        }
    }, 500)
}

// Delete field via API
const handleDeleteField = async (fieldId) => {
    deleteField(fieldId)

    try {
        await fieldsApi.delete(formId.value, fieldId)
    } catch (error) {
        console.error('Error deleting field:', error)
        toast.error('Failed to delete field')
        // Reload form to restore state
        await loadForm()
    }
}

// Delete selected field
const handleDeleteSelectedField = () => {
    if (selectedFieldId.value) {
        handleDeleteField(selectedFieldId.value)
    }
}

// Handle page properties update from PropertiesPanel (with API)
let pageUpdateTimeout = null
const handleUpdatePage = async (updatedPage) => {
    if (!updatedPage?.id) return

    // Update local state immediately
    updatePage(updatedPage.id, updatedPage)

    // Debounce API call
    if (pageUpdateTimeout) clearTimeout(pageUpdateTimeout)
    pageUpdateTimeout = setTimeout(async () => {
        try {
            await pagesApi.update(formId.value, updatedPage.id, {
                title: updatedPage.title,
                description: updatedPage.description
            })
        } catch (error) {
            console.error('Error updating page:', error)
        }
    }, 500)
}

// Handle page update from PageManager (title inline edit)
const handleUpdatePageFromManager = async (pageId, changes) => {
    // Update local state immediately
    updatePage(pageId, changes)

    // Debounce API call
    if (pageUpdateTimeout) clearTimeout(pageUpdateTimeout)
    pageUpdateTimeout = setTimeout(async () => {
        try {
            await pagesApi.update(formId.value, pageId, {
                title: changes.title,
                description: changes.description
            })
        } catch (error) {
            console.error('Error updating page:', error)
        }
    }, 500)
}

// Add page via API
const handleAddPage = async () => {
    try {
        const response = await pagesApi.create(formId.value, {
            title: `Step ${pages.value.length + 1}`
        })
        const newPage = response.data || response
        addPageLocal(mapApiPageToLocal(newPage))
    } catch (error) {
        console.error('Error adding page:', error)
        toast.error('Failed to add page')
    }
}

// Delete page via API
const handleDeletePage = async (pageId) => {
    if (pages.value.length <= 1) {
        toast.error('Cannot delete the only page')
        return
    }

    try {
        await pagesApi.delete(formId.value, pageId)
        deletePageLocal(pageId)
    } catch (error) {
        console.error('Error deleting page:', error)
        toast.error('Failed to delete page')
        // Reload form to restore state
        await loadForm()
    }
}

// Reorder pages via API
const handleReorderPages = async (oldIndex, newIndex) => {
    // Get new order
    const reorderedPages = [...pages.value]
    const [movedPage] = reorderedPages.splice(oldIndex, 1)
    reorderedPages.splice(newIndex, 0, movedPage)

    // Update local state immediately
    reorderPagesLocal(reorderedPages.map(p => p.id))

    try {
        await pagesApi.reorder(formId.value, reorderedPages.map(p => p.id))
    } catch (error) {
        console.error('Error reordering pages:', error)
        toast.error('Failed to reorder pages')
        // Reload form to restore state
        await loadForm()
    }
}

// Handle fields reorder via API
// Note: In multi-page mode, newFields only contains fields from the current page
// In single-page mode, newFields contains all fields
const handleFieldsReorder = async (newFields) => {
    if (pages.value.length > 1) {
        // Multi-page mode: merge with fields from other pages
        const otherPageFields = fields.value.filter(f => f.pageId !== currentPageId.value)
        fields.value = [...otherPageFields, ...newFields]
    } else {
        // Single-page mode: replace all fields
        fields.value = newFields
    }

    try {
        // API expects field IDs array for reordering (all fields)
        const fieldOrder = fields.value.map(f => f.id)
        await fieldsApi.reorder(formId.value, fieldOrder)
    } catch (error) {
        console.error('Error reordering fields:', error)
        toast.error('Failed to reorder fields')
    }
}

// Save entire form
const handleSaveForm = async () => {
    if (fields.value.length === 0) {
        toast.error('Please add at least one field to the form')
        return
    }

    const fieldsWithoutLabels = fields.value.filter(f => !f.label)
    if (fieldsWithoutLabels.length > 0) {
        toast.error('All fields must have a label')
        return
    }

    isSaving.value = true

    try {
        await forms.update(formId.value, apiPayload.value)
        toast.success('Form saved successfully!')
        isSettingsOpen.value = false
    } catch (error) {
        console.error('Error saving form:', error)
        toast.error('Failed to save form. Please try again.')
    } finally {
        isSaving.value = false
    }
}

// Cancel and go back
const handleCancel = () => {
    router.push('/forms')
}

// Click outside to deselect field
const handleLayoutClick = (event) => {
    const isFieldCard = event.target.closest('.field-card')
    const isPropertiesPanel = event.target.closest('.properties-panel')

    if (!isFieldCard && !isPropertiesPanel) {
        deselectField()
    }
}
</script>
