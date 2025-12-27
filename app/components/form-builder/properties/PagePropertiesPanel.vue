<!-- app/components/form-builder/properties/PagePropertiesPanel.vue -->
<template>
    <div class="space-y-4 mx-3 my-4">
        <!-- Page Title -->
        <div>
            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                Page Title
            </label>
            <input
                type="text"
                :value="page.title"
                @input="updateField('title', $event.target.value)"
                placeholder="Enter page title"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 text-black outline-none transition focus:border-brand-500 dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-brand-500"
            />
        </div>

        <!-- Page Description -->
        <div>
            <label class="mb-2.5 block text-sm font-medium text-black dark:text-white">
                Page Description
            </label>
            <textarea
                :value="page.description"
                @input="updateField('description', $event.target.value)"
                placeholder="Optional description for this page"
                rows="3"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 text-black outline-none transition focus:border-brand-500 dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-brand-500 resize-none"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Shown to users in the form wizard
            </p>
        </div>

        <!-- Page Info -->
        <div class="pt-4 border-t border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">Fields on this page:</span>
                <span class="font-medium text-black dark:text-white">{{ fieldCount }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    page: {
        type: Object,
        required: true
    },
    fieldCount: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['update:page'])

const updateField = (key, value) => {
    emit('update:page', { ...props.page, [key]: value })
}
</script>
