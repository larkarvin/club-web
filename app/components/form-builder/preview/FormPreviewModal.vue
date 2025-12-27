<!-- app/components/form-builder/preview/FormPreviewModal.vue -->
<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50"
        @click.self="$emit('close')"
    >
        <div class="bg-white dark:bg-boxdark rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-stroke dark:border-strokedark">
                <h3 class="text-xl font-semibold text-black dark:text-white">Form Preview</h3>
                <button
                    @click="$emit('close')"
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 overflow-auto flex-1">
                <!-- Progress Indicator (only if multiple pages) -->
                <div v-if="pages.length > 1" class="flex items-center justify-center mb-8">
                    <template v-for="(page, index) in pages" :key="page.id">
                        <div
                            class="flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium cursor-pointer transition-colors"
                            :class="index <= currentPageIndex
                                ? 'bg-brand-500 text-white'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                            @click="goToPage(index)"
                        >
                            {{ index + 1 }}
                        </div>
                        <div
                            v-if="index < pages.length - 1"
                            class="w-12 h-1 mx-2 transition-colors"
                            :class="index < currentPageIndex
                                ? 'bg-brand-500'
                                : 'bg-gray-200 dark:bg-gray-700'"
                        />
                    </template>
                </div>

                <!-- Current Page Title -->
                <div v-if="currentPageData" class="mb-6 text-center">
                    <h4 class="text-lg font-semibold text-black dark:text-white">
                        {{ currentPageData.title || `Step ${currentPageIndex + 1}` }}
                    </h4>
                    <p v-if="currentPageData.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {{ currentPageData.description }}
                    </p>
                </div>

                <!-- Fields for Current Page -->
                <div class="space-y-4">
                    <div
                        v-for="field in currentPageFieldsPreview"
                        :key="field.id"
                        class="border border-stroke dark:border-strokedark rounded-lg p-4"
                    >
                        <label class="block text-sm font-medium text-black dark:text-white mb-2">
                            {{ field.label || 'Untitled Field' }}
                            <span v-if="field.required" class="text-error-500">*</span>
                        </label>

                        <!-- Text Input Preview -->
                        <input
                            v-if="field.type === 'text' || field.type === 'email'"
                            :type="field.type === 'email' ? 'email' : 'text'"
                            :placeholder="field.placeholder || ''"
                            disabled
                            class="w-full rounded border border-stroke bg-gray-50 py-2.5 px-4 text-black outline-none dark:border-strokedark dark:bg-gray-800 dark:text-white cursor-not-allowed"
                        />

                        <!-- Textarea Preview -->
                        <textarea
                            v-else-if="field.type === 'textarea'"
                            :placeholder="field.placeholder || ''"
                            disabled
                            rows="3"
                            class="w-full rounded border border-stroke bg-gray-50 py-2.5 px-4 text-black outline-none dark:border-strokedark dark:bg-gray-800 dark:text-white cursor-not-allowed resize-none"
                        />

                        <!-- Number Input Preview -->
                        <input
                            v-else-if="field.type === 'number'"
                            type="number"
                            :placeholder="field.placeholder || ''"
                            disabled
                            class="w-full rounded border border-stroke bg-gray-50 py-2.5 px-4 text-black outline-none dark:border-strokedark dark:bg-gray-800 dark:text-white cursor-not-allowed"
                        />

                        <!-- Phone Input Preview -->
                        <input
                            v-else-if="field.type === 'phone'"
                            type="tel"
                            :placeholder="field.placeholder || 'Phone number'"
                            disabled
                            class="w-full rounded border border-stroke bg-gray-50 py-2.5 px-4 text-black outline-none dark:border-strokedark dark:bg-gray-800 dark:text-white cursor-not-allowed"
                        />

                        <!-- Select Preview -->
                        <select
                            v-else-if="field.type === 'select'"
                            disabled
                            class="w-full rounded border border-stroke bg-gray-50 py-2.5 px-4 text-black outline-none dark:border-strokedark dark:bg-gray-800 dark:text-white cursor-not-allowed"
                        >
                            <option value="">{{ field.placeholder || 'Select an option' }}</option>
                            <option v-for="opt in field.options" :key="opt.id" :value="opt.value">
                                {{ opt.label }}
                                <template v-if="opt.price"> (+{{ formatPrice(opt.price) }})</template>
                            </option>
                        </select>

                        <!-- Description -->
                        <p v-if="field.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ field.description }}
                        </p>
                    </div>

                    <!-- Empty state for page with no fields -->
                    <div v-if="currentPageFieldsPreview.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No fields on this page</p>
                    </div>
                </div>
            </div>

            <!-- Modal Footer with Navigation -->
            <div class="flex items-center justify-between p-6 border-t border-stroke dark:border-strokedark">
                <!-- Previous Button -->
                <button
                    v-if="currentPageIndex > 0"
                    @click="previousPage"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-stroke px-5 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
                <div v-else></div>

                <!-- Next / Submit Button -->
                <button
                    v-if="!isLastPage"
                    @click="nextPage"
                    class="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600"
                >
                    Next
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <button
                    v-else
                    disabled
                    class="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 font-medium text-white opacity-75 cursor-not-allowed"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Submit (Preview Only)
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    pages: {
        type: Array,
        required: true
    },
    fields: {
        type: Array,
        required: true
    }
})

defineEmits(['close'])

// Current page index in the wizard
const currentPageIndex = ref(0)

// Current page data
const currentPageData = computed(() => props.pages[currentPageIndex.value] || null)

// Fields for current page
const currentPageFieldsPreview = computed(() => {
    if (!currentPageData.value) return []
    return props.fields.filter(f => f.pageId === currentPageData.value.id)
})

// Is this the last page?
const isLastPage = computed(() => currentPageIndex.value === props.pages.length - 1)

// Navigation methods
const nextPage = () => {
    if (currentPageIndex.value < props.pages.length - 1) {
        currentPageIndex.value++
    }
}

const previousPage = () => {
    if (currentPageIndex.value > 0) {
        currentPageIndex.value--
    }
}

const goToPage = (index) => {
    currentPageIndex.value = index
}

// Price formatting
const formatPrice = (cents) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}
</script>
