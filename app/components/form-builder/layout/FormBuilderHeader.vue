<!-- app/components/form-builder/layout/FormBuilderHeader.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
                Form Information
            </h3>
        </div>
        <div class="p-6.5">
            <BaseInput :model-value="name" @update:model-value="$emit('update:name', $event)" label="Form Name"
                placeholder="Enter form name" required />

            <BaseInput :model-value="slug" @update:model-value="$emit('update:slug', $event)" label="Slug"
                placeholder="form-slug" required />

            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL: {{ previewUrl }}
            </p>
        </div>
    </div>
</template>

<script setup>
import BaseInput from '~/components/forms/BaseInput.vue'

const props = defineProps({
    name: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        default: ''
    },
    previewUrl: {
        type: String,
        default: ''
    }
})

defineEmits(['update:name', 'update:slug'])
</script>