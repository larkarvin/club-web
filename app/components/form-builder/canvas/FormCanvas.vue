<!-- app/components/form-builder/canvas/FormCanvas.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                Form Preview
                <span v-if="localFields.length > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({{ localFields.length }} {{ localFields.length === 1 ? 'field' : 'fields' }})
                </span>
            </h3>
        </div>
        <div class="p-6.5 min-h-[500px] m-3">
            <!-- Empty State -->
            <EmptyCanvas v-if="localFields.length === 0" />

            <!-- Fields List with vuedraggable -->
            <draggable v-else v-model="localFields" item-key="id" :animation="300" ghost-class="ghost"
                @change="handleChange" class="space-y-4">
                <template #item="{ element: field, index }">
                    <FieldCard :field="field" :index="index" :selected="field.id === selectedId"
                        @select="emit('select', field.id)" @delete="emit('delete', field.id)">
                        <!-- Dynamic field preview based on type -->
                        <TextFieldPreview v-if="field.type === 'text'" :field="field" />
                        <TextAreaFieldPreview v-else-if="field.type === 'textarea'" :field="field" />
                        <SelectFieldPreview v-else-if="field.type === 'select'" :field="field" />
                    </FieldCard>
                </template>
            </draggable>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import EmptyCanvas from './EmptyCanvas.vue'
import FieldCard from './FieldCard.vue'
import TextFieldPreview from '../fields/TextFieldPreview.vue'
import TextAreaFieldPreview from '../fields/TextAreaFieldPreview.vue'
import SelectFieldPreview from '../fields/SelectFieldPreview.vue'

const props = defineProps({
    fields: {
        type: Array,
        default: () => []
    },
    selectedId: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['select', 'delete', 'update:fields'])

// Local copy of fields for v-model with draggable
const localFields = ref([...props.fields])

// Sync with parent when props change
watch(() => props.fields, (newFields) => {
    localFields.value = [...newFields]
}, { deep: true })

// Handle any change (moved, added, removed)
const handleChange = () => {
    emit('update:fields', localFields.value)
}
</script>

<style scoped>
.ghost {
    opacity: 0.5;
    background: #dbeafe;
    border-radius: 0.5rem;
}
</style>
