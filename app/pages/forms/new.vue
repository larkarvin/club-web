<!-- pages/forms/new.vue -->
<template>
    <admin-layout @click="handleLayoutClick">
        <page-breadcrumb pageTitle="New Form" />

        <!-- Top Bar: Inline Editable Name + Settings Button -->
        <FormBuilderTopBar v-model="formName" @open-settings="isSettingsOpen = true" />

        <!-- Form Settings Modal -->
        <FormSettingsModal :is-open="isSettingsOpen" :name="formName" :slug="formSlug" :preview-url="previewUrl"
            :show-cancel="true" save-button-text="Save" @close="isSettingsOpen = false" @save="handleSettingsSave" />

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

            <!-- Save Button (Right) -->
            <button @click="handleSave" :disabled="!canSave"
                class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Save Form
            </button>
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
    reorderFields,
    saveForm
} = useFormBuilder()

// Initialize with "Untitled Form"
if (!formName.value) {
    formName.value = 'Untitled Form'
    formSlug.value = 'untitled-form'
}

// Settings modal state
const isSettingsOpen = ref(false)

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
    const result = saveForm()

    if (result.success) {
        toast.success('Form saved successfully!')
        console.log('Saved form:', result.data)
        // TODO: Navigate to forms list or form detail page
        // router.push('/forms')
    } else {
        toast.error(result.error || 'Failed to save form')
    }
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