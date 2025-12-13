<!-- app/components/form-builder/FormSettingsModal.vue -->
<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeModal">
        <div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <!-- Header -->
            <div class="mb-6">
                <h3 class="text-xl font-semibold text-black dark:text-white">
                    Form Settings
                </h3>
            </div>

            <!-- Form Name -->
            <BaseInput v-model="localName" label="Form Name" placeholder="Enter form name" required
                @input="handleNameInput" />

            <!-- Slug -->
            <BaseInput v-model="localSlug" label="Slug" placeholder="form-slug" required />

            <!-- URL Preview -->
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6">
                URL: {{ previewUrl }}
            </p>

            <!-- Buttons -->
            <div class="flex justify-end gap-3">
                <button v-if="showCancel" @click="closeModal"
                    class="inline-flex items-center justify-center rounded-md border border-stroke px-6 py-3 text-center font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                    Cancel
                </button>
                <button @click="handleSave" :disabled="!canSave"
                    class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed">
                    {{ saveButtonText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseInput from '~/components/forms/BaseInput.vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
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
    },
    showCancel: {
        type: Boolean,
        default: true
    },
    saveButtonText: {
        type: String,
        default: 'Save'
    }
})

const emit = defineEmits(['close', 'save'])

// Local copies for editing
const localName = ref(props.name)
const localSlug = ref(props.slug)

// Watch for external changes
watch(() => props.name, (newName) => {
    localName.value = newName
})

watch(() => props.slug, (newSlug) => {
    localSlug.value = newSlug
})

// Auto-generate slug from name
const handleNameInput = () => {
    // Only auto-generate if slug is empty or matches previous auto-generated slug
    if (!localSlug.value || localSlug.value === slugify(props.name)) {
        localSlug.value = slugify(localName.value)
    }
}

// Slugify helper
const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// Can save if name and slug are filled
const canSave = computed(() => {
    return localName.value && localSlug.value
})

// Handle save
const handleSave = () => {
    if (!canSave.value) return

    emit('save', {
        name: localName.value,
        slug: localSlug.value
    })
}

// Close modal
const closeModal = () => {
    if (props.showCancel) {
        emit('close')
    }
}
</script>