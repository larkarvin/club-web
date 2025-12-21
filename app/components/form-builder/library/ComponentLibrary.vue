<!-- app/components/form-builder/library/ComponentLibrary.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white mx-3">
                Components
            </h3>
        </div>
        <div class="p-4">
            <div class="space-y-3">
                <DraggableFieldType type="text" label="Text Input" icon="📝"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="textarea" label="Text Area" icon="📄"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="select" label="Select Option" icon="📋"
                    @add-field="(type) => $emit('add-field', type)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import DraggableFieldType from './DraggableFieldType.vue'

defineEmits(['add-field'])
</script>
