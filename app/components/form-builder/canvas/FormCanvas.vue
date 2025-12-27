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

            <!-- Fields List -->
            <div v-else ref="fieldListRef" class="space-y-4">
                <FieldCard
                    v-for="(field, index) in localFields"
                    :key="field.id"
                    :data-id="field.id"
                    :field="field"
                    :index="index"
                    :selected="field.id === selectedId"
                    @select="emit('select', field.id)"
                    @delete="handleDelete(field.id)"
                >
                    <TextFieldPreview v-if="field.type === 'text'" :field="field" />
                    <TextAreaFieldPreview v-else-if="field.type === 'textarea'" :field="field" />
                    <SelectFieldPreview v-else-if="field.type === 'select'" :field="field" />
                    <EmailFieldPreview v-else-if="field.type === 'email'" :field="field" />
                    <PhoneFieldPreview v-else-if="field.type === 'phone'" :field="field" />
                    <NumberFieldPreview v-else-if="field.type === 'number'" :field="field" />
                </FieldCard>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import EmptyCanvas from './EmptyCanvas.vue'
import FieldCard from './FieldCard.vue'
import TextFieldPreview from '../fields/TextFieldPreview.vue'
import TextAreaFieldPreview from '../fields/TextAreaFieldPreview.vue'
import SelectFieldPreview from '../fields/SelectFieldPreview.vue'
import EmailFieldPreview from '../fields/EmailFieldPreview.vue'
import PhoneFieldPreview from '../fields/PhoneFieldPreview.vue'
import NumberFieldPreview from '../fields/NumberFieldPreview.vue'

const props = defineProps({
    fields: {
        type: Array,
        default: () => []
    },
    selectedId: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['select', 'delete', 'update:fields'])

// Template ref for sortable container
const fieldListRef = ref(null)
let sortableInstance = null

// Local copy of fields
const localFields = ref([])

// Sync with parent when props change
watch(() => props.fields, (newFields) => {
    localFields.value = newFields ? [...newFields] : []
}, { deep: true, immediate: true })

// Initialize SortableJS on mount
onMounted(async () => {
    await nextTick()
    if (fieldListRef.value && localFields.value.length > 0) {
        initSortable()
    }
})

// Watch for fields changes to reinitialize sortable
watch(() => localFields.value.length, async (newLen, oldLen) => {
    if (newLen > 0 && oldLen === 0) {
        await nextTick()
        initSortable()
    }
})

// Initialize SortableJS
const initSortable = async () => {
    if (sortableInstance) {
        sortableInstance.destroy()
    }

    if (!fieldListRef.value) return

    try {
        const Sortable = (await import('sortablejs')).default
        sortableInstance = Sortable.create(fieldListRef.value, {
            handle: '.drag-handle',
            animation: 200,
            ghostClass: 'ghost',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt
                if (oldIndex !== newIndex) {
                    // Reorder the array
                    const newFields = [...localFields.value]
                    const [movedItem] = newFields.splice(oldIndex, 1)
                    newFields.splice(newIndex, 0, movedItem)
                    localFields.value = newFields
                    emit('update:fields', newFields)
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

// Handle delete
const handleDelete = (fieldId) => {
    emit('delete', fieldId)
}
</script>

<style scoped>
.ghost {
    opacity: 0.5;
    background: #dbeafe;
    border-radius: 0.5rem;
}
</style>
