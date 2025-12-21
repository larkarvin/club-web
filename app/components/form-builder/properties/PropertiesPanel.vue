<!-- app/components/form-builder/properties/PropertiesPanel.vue -->
<template>
    <div
        class="properties-panel rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                Field Properties
            </h3>
        </div>
        <div class="p-6.5">
            <!-- Empty State -->
            <EmptyProperties v-if="!field" />

            <!-- Text Field Properties -->
            <TextFieldProperties v-else-if="field.type === 'text'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- TextArea Field Properties (same as text) -->
            <TextFieldProperties v-else-if="field.type === 'textarea'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- Select Field Properties -->
            <SelectFieldProperties v-else-if="field.type === 'select'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />
        </div>
    </div>
</template>

<script setup>
import EmptyProperties from './EmptyProperties.vue'
import TextFieldProperties from './TextFieldProperties.vue'
import SelectFieldProperties from './SelectFieldProperties.vue'

const props = defineProps({
    field: {
        type: Object,
        default: null
    }
})

defineEmits(['update', 'delete'])
</script>