<!-- app/components/form-builder/properties/PropertiesPanel.vue -->
<template>
    <div
        class="properties-panel rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                {{ field ? 'Field Properties' : 'Page Properties' }}
            </h3>
        </div>
        <div class="p-6.5">
            <!-- Page Properties (when no field selected but page provided) -->
            <PagePropertiesPanel
                v-if="!field && page"
                :page="page"
                :field-count="pageFieldCount"
                @update:page="$emit('update-page', $event)"
            />

            <!-- Empty State (when no field and no page) -->
            <EmptyProperties v-else-if="!field" />

            <!-- Text Field Properties -->
            <TextFieldProperties v-else-if="field.type === 'text'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- TextArea Field Properties (same as text) -->
            <TextFieldProperties v-else-if="field.type === 'textarea'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- Select Field Properties -->
            <SelectFieldProperties v-else-if="field.type === 'select'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- Email Field Properties (same as text) -->
            <TextFieldProperties v-else-if="field.type === 'email'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- Phone Field Properties (same as text) -->
            <TextFieldProperties v-else-if="field.type === 'phone'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />

            <!-- Number Field Properties -->
            <NumberFieldProperties v-else-if="field.type === 'number'" :field="field"
                @update:field="$emit('update', $event)" @delete="$emit('delete')" />
        </div>
    </div>
</template>

<script setup>
import EmptyProperties from './EmptyProperties.vue'
import PagePropertiesPanel from './PagePropertiesPanel.vue'
import TextFieldProperties from './TextFieldProperties.vue'
import SelectFieldProperties from './SelectFieldProperties.vue'
import NumberFieldProperties from './NumberFieldProperties.vue'

const props = defineProps({
    field: {
        type: Object,
        default: null
    },
    page: {
        type: Object,
        default: null
    },
    pageFieldCount: {
        type: Number,
        default: 0
    }
})

defineEmits(['update', 'delete', 'update-page'])
</script>