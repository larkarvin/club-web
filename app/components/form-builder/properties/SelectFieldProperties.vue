<!-- app/components/form-builder/properties/SelectFieldProperties.vue -->
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

        <!-- OPTIONS Section -->
        <CollapsibleSection title="OPTIONS" :default-open="true">
            <!-- Options List -->
            <div ref="optionsListRef" class="space-y-2">
                <div v-for="(option, index) in localField.options" :key="option.id" :data-id="option.id"
                    class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-meta-4 rounded-lg border border-stroke dark:border-strokedark">
                    <!-- Drag Handle -->
                    <div class="option-drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="15" cy="5" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="15" cy="19" r="1.5" />
                        </svg>
                    </div>

                    <!-- Option Fields -->
                    <div class="flex-1 grid grid-cols-3 gap-2">
                        <!-- Value -->
                        <input type="text" :value="option.value"
                            @input="updateOption(index, 'value', $event.target.value)" placeholder="Value"
                            class="w-full rounded border border-stroke bg-white px-2 py-1.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white" />

                        <!-- Label -->
                        <input type="text" :value="option.label"
                            @input="updateOption(index, 'label', $event.target.value)" placeholder="Label"
                            class="w-full rounded border border-stroke bg-white px-2 py-1.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white" />

                        <!-- Price -->
                        <input type="number" :value="option.price" step="0.01" min="0"
                            @input="updateOption(index, 'price', parseFloat($event.target.value) || 0)"
                            placeholder="Price"
                            class="w-full rounded border border-stroke bg-white px-2 py-1.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white" />
                    </div>

                    <!-- Delete Button (trash icon) -->
                    <button @click.stop.prevent="removeOption(index)"
                        class="p-1 text-gray-400 hover:text-meta-1 transition-colors" title="Remove option">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Column Headers (subtle) -->
            <div class="flex items-center gap-2 px-3 mt-1 mb-2">
                <div class="w-6"></div>
                <div class="flex-1 grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <span>Value</span>
                    <span>Label</span>
                    <span>Price</span>
                </div>
                <div class="w-7"></div>
            </div>

            <!-- Add Option Button -->
            <button @click="addOption"
                class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed border-stroke dark:border-strokedark text-gray-500 hover:border-primary hover:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="text-sm font-medium">Add Option</span>
            </button>
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
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import BaseInput from '~/components/forms/BaseInput.vue'
import CollapsibleSection from '../ui/CollapsibleSection.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'

const props = defineProps({
    field: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:field', 'delete'])

// Template ref for sortable options
const optionsListRef = ref(null)
let sortableInstance = null

// Local copy for editing
const localField = ref({ ...props.field })

// Watch for external changes
watch(() => props.field, (newField) => {
    localField.value = { ...newField }
}, { deep: true })

// Initialize SortableJS on mount
onMounted(async () => {
    await nextTick()
    if (optionsListRef.value && localField.value.options?.length > 0) {
        initSortable()
    }
})

// Watch for options changes to reinitialize sortable
watch(() => localField.value.options?.length, async (newLen, oldLen) => {
    if (newLen > 0) {
        await nextTick()
        initSortable()
    }
})

// Initialize SortableJS
const initSortable = async () => {
    if (sortableInstance) {
        sortableInstance.destroy()
    }

    if (!optionsListRef.value) return

    try {
        const Sortable = (await import('sortablejs')).default
        sortableInstance = Sortable.create(optionsListRef.value, {
            handle: '.option-drag-handle',
            animation: 200,
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt
                if (oldIndex !== newIndex) {
                    const newOptions = [...localField.value.options]
                    const [movedItem] = newOptions.splice(oldIndex, 1)
                    newOptions.splice(newIndex, 0, movedItem)
                    localField.value.options = newOptions
                    emit('update:field', localField.value)
                }
            }
        })
    } catch (error) {
        console.error('Failed to load SortableJS:', error)
    }
}

// Cleanup on unmount
onBeforeUnmount(() => {
    if (sortableInstance) {
        sortableInstance.destroy()
        sortableInstance = null
    }
})

// Update field property
const updateField = (property, value) => {
    localField.value[property] = value
    emit('update:field', localField.value)
}

// Update a specific option
const updateOption = (index, property, value) => {
    localField.value.options[index][property] = value
    emit('update:field', localField.value)
}

// Add new option
const addOption = () => {
    const newId = `opt_${Date.now()}`
    const optionNumber = localField.value.options.length + 1
    localField.value.options.push({
        id: newId,
        value: `option${optionNumber}`,
        label: `Option ${optionNumber}`,
        price: 0
    })
    emit('update:field', localField.value)
}

// Remove option
const removeOption = (index) => {
    if (localField.value.options.length <= 1) {
        toast.error('You must have at least one option')
        return
    }
    localField.value.options.splice(index, 1)
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
