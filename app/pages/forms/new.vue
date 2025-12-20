<!-- pages/forms/new.vue -->
<template>
    <admin-layout @click="handleLayoutClick">
        <page-breadcrumb pageTitle="New Form" />

        <!-- Top Bar: Inline Editable Name + Settings Button -->
        <FormBuilderTopBar v-model="formName" @open-settings="isSettingsOpen = true" />

        <!-- Form Settings Modal -->
        <FormSettingsModal :is-open="isSettingsOpen" :name="formName" :slug="formSlug" :preview-url="previewUrl"
            :show-cancel="true" save-button-text="Save" @close="isSettingsOpen = false" @save="handleSettingsSave" />

        <!-- VueForm Schema Modal -->
        <div v-if="isSchemaModalOpen" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50"
            @click.self="isSchemaModalOpen = false">
            <div class="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <!-- Modal Header -->
                <div class="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark">
                    <h3 class="text-xl font-semibold text-black dark:text-white">VueForm Schema</h3>
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
                        class="bg-gray-100 dark:bg-meta-4 p-4 rounded-lg text-sm overflow-x-auto"><code>{{ vueformSchemaFormatted }}</code></pre>
                </div>

                <!-- Modal Footer -->
                <div class="flex justify-end gap-3 p-6 border-t border-stroke dark:border-strokedark">
                    <button @click="copySchema"
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
            <!-- Left: Component Library -->
            <template #library>
                <ComponentLibrary @add-field="addField" @dragend="handleLibraryDragEnd" />
            </template>

            <!-- Center: Canvas -->
            <template #canvas>
                <FormCanvas :fields="fields" :selected-id="selectedFieldId" @add-field="addField" @select="selectField"
                    @delete="deleteField" @reorder="reorderFields" />
            </template>

            <!-- Right: Properties Panel -->
            <template #properties>
                <PropertiesPanel :field="selectedField" @update="handleUpdateField"
                    @delete="handleDeleteSelectedField" />
            </template>
        </FormBuilderLayout>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center mt-6">
            <!-- Cancel Button (Left) -->
            <button @click="handleCancel"
                class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                Cancel
            </button>

            <!-- Right Buttons -->
            <div class="flex items-center gap-3">
                <!-- Preview Schema Button -->
                <button @click="isSchemaModalOpen = true"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Preview Schema
                </button>

                <!-- Save Button -->
                <button @click="handleSave" :disabled="!canSave"
                    class="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-center font-medium text-white hover:bg-brand-600 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Form
                </button>
            </div>
        </div>
    </admin-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AdminLayout from '~/components/layout/AdminLayout.vue'
import PageBreadcrumb from '~/components/common/PageBreadcrumb.vue'
import FormBuilderTopBar from '~/components/form-builder/FormBuilderTopBar.vue'
import FormSettingsModal from '~/components/form-builder/FormSettingsModal.vue'
import FormBuilderLayout from '~/components/form-builder/layout/FormBuilderLayout.vue'
import ComponentLibrary from '~/components/form-builder/library/ComponentLibrary.vue'
import FormCanvas from '~/components/form-builder/canvas/FormCanvas.vue'
import PropertiesPanel from '~/components/form-builder/properties/PropertiesPanel.vue'
import { useFormBuilder } from '~/composables/useFormBuilder'
import { useVueformSchema } from '~/composables/useVueformSchema'

const router = useRouter()

const {
    formName,
    formSlug,
    fields,
    selectedFieldId,
    selectedField,
    previewUrl,
    addField,
    updateField,
    deleteField,
    selectField,
    deselectField,
    reorderFields
} = useFormBuilder()

// VueForm schema generation
const { schemaFormatted: vueformSchemaFormatted } = useVueformSchema(fields)

// Initialize with "Untitled Form"
if (!formName.value) {
    formName.value = 'Untitled Form'
    formSlug.value = 'untitled-form'
}

// Settings modal state
const isSettingsOpen = ref(false)

// Schema modal state
const isSchemaModalOpen = ref(false)

// Copy schema to clipboard
const copySchema = async () => {
    try {
        await navigator.clipboard.writeText(vueformSchemaFormatted.value)
        toast.success('Schema copied to clipboard!')
    } catch (err) {
        toast.error('Failed to copy schema')
    }
}

// Handle settings save
const handleSettingsSave = (settings) => {
    formName.value = settings.name
    formSlug.value = settings.slug
    isSettingsOpen.value = false
    toast.success('Form settings updated!')
}

// Can save if form name and slug are filled
const canSave = computed(() => {
    return formName.value && formSlug.value
})

// Update selected field
const handleUpdateField = (updatedField) => {
    if (selectedFieldId.value) {
        updateField(selectedFieldId.value, updatedField)
    }
}

// Delete selected field
const handleDeleteSelectedField = () => {
    if (selectedFieldId.value) {
        deleteField(selectedFieldId.value)
    }
}

// Save form
const handleSave = () => {
    if (fields.value.length === 0) {
        toast.error('Please add at least one field to the form')
        return
    }

    // Check if all fields have labels
    const fieldsWithoutLabels = fields.value.filter(f => !f.label)
    if (fieldsWithoutLabels.length > 0) {
        toast.error('All fields must have a label')
        return
    }

    // Show the VueForm schema modal
    isSchemaModalOpen.value = true
    toast.success('Form schema generated!')
}

// Cancel
const handleCancel = () => {
    const hasChanges = formName.value !== 'Untitled Form' || formSlug.value !== 'untitled-form' || fields.value.length > 0

    if (hasChanges) {
        if (confirm('Are you sure? Any unsaved changes will be lost.')) {
            router.push('/forms')
        }
    } else {
        router.push('/forms')
    }
}

// Click outside to deselect field
const handleLayoutClick = (event) => {
    // Check if click is outside field card and properties panel
    const isFieldCard = event.target.closest('.field-card')
    const isPropertiesPanel = event.target.closest('.properties-panel')

    if (!isFieldCard && !isPropertiesPanel) {
        deselectField()
    }
}

// Handle dragend from library to clear indicators
const handleLibraryDragEnd = () => {
    // This will be handled by FormCanvas's dragend handler
    // but we can add logic here if needed
}
</script>