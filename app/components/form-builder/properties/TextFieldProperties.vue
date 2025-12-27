<!-- app/components/form-builder/properties/TextFieldProperties.vue -->
<template>
    <div>
        <!-- PROPERTIES Section -->
        <CollapsibleSection title="PROPERTIES" :default-open="true">
            <!-- Label -->
            <BaseInput :model-value="localField.label" @update:model-value="updateField('label', $event)" label="Label"
                placeholder="Enter field label" />

            <!-- Description -->
            <div>
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Description
                </label>
                <textarea :value="localField.description" @input="updateField('description', $event.target.value)"
                    rows="3" placeholder="Enter field description (optional)"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
            </div>

            <!-- Placeholder -->
            <BaseInput :model-value="localField.placeholder" @update:model-value="updateField('placeholder', $event)"
                label="Placeholder" placeholder="Enter placeholder text" />

            <!-- Divider -->
            <hr class="border-stroke dark:border-strokedark" />

            <!-- Required Switch -->
            <ToggleSwitch :model-value="localField.required" @update:model-value="updateField('required', $event)"
                label="Required" />

            <!-- Disabled After Submission Switch -->
            <ToggleSwitch :model-value="localField.disabledAfterSubmission"
                @update:model-value="updateField('disabledAfterSubmission', $event)" label="Disabled After Submission"
                subtext="Controls if field is editable after submission" />
        </CollapsibleSection>

        <!-- Delete Button -->
        <div class="p-6">
            <button @click="handleDelete"
                class="w-full inline-flex items-center justify-center gap-2 rounded-md border border-meta-1 px-6 py-3 text-center font-medium text-meta-1 hover:bg-meta-1 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Field
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseInput from '~/components/forms/BaseInput.vue'
import CollapsibleSection from '../ui/CollapsibleSection.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import { toast } from 'vue-sonner'

const props = defineProps({
    field: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:field', 'delete'])

// Local copy for editing
const localField = ref({ ...props.field })

// Watch for external changes
watch(() => props.field, (newField) => {
    localField.value = { ...newField }
}, { deep: true })

// Update field property
const updateField = (property, value) => {
    localField.value[property] = value
    emit('update:field', localField.value)
}

// Handle delete
const handleDelete = () => {
    toast.warning(`Delete "${props.field.label || 'Untitled'}"?`, {
        description: 'This field will be permanently removed.',
        cancel: {
            label: 'Cancel',
            onClick: () => {}
        },
        action: {
            label: 'Delete',
            onClick: () => emit('delete')
        },
        duration: 8000,
        classNames: {
            actionButton: '!bg-meta-1 !text-white hover:!bg-red-600',
        }
    })
}
</script>
