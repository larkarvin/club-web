<!-- app/components/form-builder/properties/PropertiesPanel.vue -->
<template>
    <div
        class="properties-panel rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                {{ panelTitle }}
            </h3>
        </div>
        <div class="p-6.5">
            <!-- Empty State -->
            <EmptyProperties v-if="!field && !row" />

            <!-- Row Properties -->
            <RowProperties v-else-if="row" :row="row" @update:row="$emit('update-row', $event)" />

            <!-- Text Field Properties -->
            <TextFieldProperties v-else-if="field && field.type === 'text'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import EmptyProperties from './EmptyProperties.vue'
import RowProperties from './RowProperties.vue'
import TextFieldProperties from './TextFieldProperties.vue'

const props = defineProps({
    field: {
        type: Object,
        default: null
    },
    row: {
        type: Object,
        default: null
    }
})

defineEmits(['update', 'delete', 'update-row'])

const panelTitle = computed(() => {
    if (props.row) return 'Row Properties'
    if (props.field) return 'Field Properties'
    return 'Properties'
})
</script>
