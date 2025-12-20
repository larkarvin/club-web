<!-- app/components/form-builder/properties/RowProperties.vue -->
<template>
    <div>
        <!-- ROW PROPERTIES Section -->
        <CollapsibleSection title="ROW PROPERTIES" :default-open="true">
            <!-- Description -->
            <div>
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Description
                </label>
                <textarea :value="localRow.description" @input="updateRow('description', $event.target.value)" rows="3"
                    placeholder="Enter row description (optional)"
                    class="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"></textarea>
            </div>

            <!-- Description Position -->
            <div>
                <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Description Position
                </label>
                <div class="flex gap-3">
                    <button @click="updateRow('descriptionPosition', 'top')" :class="[
                        'flex-1 py-2 px-4 rounded border-[1.5px] text-sm font-medium transition-colors',
                        localRow.descriptionPosition !== 'bottom'
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke dark:border-strokedark text-black dark:text-white hover:border-primary'
                    ]">
                        Top
                    </button>
                    <button @click="updateRow('descriptionPosition', 'bottom')" :class="[
                        'flex-1 py-2 px-4 rounded border-[1.5px] text-sm font-medium transition-colors',
                        localRow.descriptionPosition === 'bottom'
                            ? 'border-primary bg-primary text-white'
                            : 'border-stroke dark:border-strokedark text-black dark:text-white hover:border-primary'
                    ]">
                        Bottom
                    </button>
                </div>
            </div>
        </CollapsibleSection>

        <!-- ROW INFO Section -->
        <CollapsibleSection title="ROW INFO" :default-open="false">
            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p><span class="font-medium">Fields:</span> {{ row.fields.length }} / 2</p>
                <p><span class="font-medium">Row ID:</span> {{ row.id }}</p>
            </div>
        </CollapsibleSection>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CollapsibleSection from '../ui/CollapsibleSection.vue'

const props = defineProps({
    row: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:row'])

// Local copy for editing
const localRow = ref({ ...props.row })

// Watch for external changes
watch(() => props.row, (newRow) => {
    localRow.value = { ...newRow }
}, { deep: true })

// Update row property
const updateRow = (property, value) => {
    localRow.value[property] = value
    emit('update:row', localRow.value)
}
</script>
