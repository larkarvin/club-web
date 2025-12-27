<!-- app/components/form-builder/library/ComponentLibrary.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="border-b border-stroke px-4 py-3 lg:px-6.5 lg:py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white text-sm lg:text-base">
                Components
            </h3>
        </div>
        <div class="p-3 lg:p-4">
            <!-- Horizontal scroll on mobile, vertical stack on desktop -->
            <div class="flex gap-2 overflow-x-auto pb-2 lg:pb-0 lg:flex-col lg:space-y-3 lg:overflow-x-visible">
                <DraggableFieldType type="text" label="Text" icon="📝"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="textarea" label="Text Area" icon="📄"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="email" label="Email" icon="📧"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="phone" label="Phone" icon="📞"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="number" label="Number" icon="🔢"
                    @add-field="(type) => $emit('add-field', type)" />
                <DraggableFieldType type="select" label="Select" icon="📋"
                    @add-field="(type) => $emit('add-field', type)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import DraggableFieldType from './DraggableFieldType.vue'

defineEmits(['add-field'])
</script>
