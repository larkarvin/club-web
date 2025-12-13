<!-- app/components/form-builder/FormBuilderTopBar.vue -->
<template>
    <div class="mb-6 flex items-center justify-between">
        <!-- Left: Inline Editable Form Name -->
        <div class="flex items-center gap-3">
            <input v-if="isEditingName" v-model="localName" @blur="handleNameBlur" @keyup.enter="handleNameBlur"
                @keyup.esc="cancelNameEdit" ref="nameInput" type="text"
                class="text-2xl font-semibold text-black dark:text-white bg-transparent border-b-2 border-primary focus:outline-none"
                placeholder="Untitled Form" />
            <h1 v-else @click="startEditingName"
                class="text-2xl font-semibold text-black dark:text-white cursor-pointer hover:text-primary transition-colors"
                :class="{ 'text-gray-400': !modelValue }">
                {{ displayName }}
            </h1>

            <!-- Edit icon hint -->
            <button v-if="!isEditingName" @click="startEditingName"
                class="text-gray-400 hover:text-primary transition-colors" title="Edit form name">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
        </div>

        <!-- Right: Form Settings Button -->
        <button @click="$emit('open-settings')"
            class="inline-flex items-center gap-2 rounded-md border border-stroke px-4 py-2 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800 transition-colors"
            title="Form Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'open-settings'])

const isEditingName = ref(false)
const localName = ref(props.modelValue)
const nameInput = ref(null)

const displayName = computed(() => {
    return props.modelValue || 'Untitled Form'
})

// Start editing name
const startEditingName = () => {
    isEditingName.value = true
    localName.value = props.modelValue
    nextTick(() => {
        nameInput.value?.focus()
        nameInput.value?.select()
    })
}

// Save name on blur or enter
const handleNameBlur = () => {
    isEditingName.value = false
    if (localName.value.trim()) {
        emit('update:modelValue', localName.value.trim())
    } else {
        localName.value = props.modelValue // Revert if empty
    }
}

// Cancel editing on escape
const cancelNameEdit = () => {
    isEditingName.value = false
    localName.value = props.modelValue
}
</script>