<!-- app/components/form-builder/library/DraggableFieldType.vue -->
<template>
    <div draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd"
        class="group cursor-grab active:cursor-grabbing rounded-lg border border-stroke bg-white px-4 py-3 transition-all hover:shadow-md hover:border-primary dark:border-strokedark dark:bg-boxdark dark:hover:border-primary"
        :class="{ 'opacity-50': isDragging }">
        <div class="flex items-center gap-3">
            <span class="text-2xl">{{ icon }}</span>
            <div class="flex-1">
                <p class="text-sm font-medium text-black dark:text-white">
                    {{ label }}
                </p>
            </div>
            <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    type: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['add-field', 'dragend'])

const isDragging = ref(false)

const handleDragStart = (event) => {
    console.log('[LIBRARY DRAGSTART] Starting drag for type:', props.type)
    isDragging.value = true
    // Set data to transfer
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('fieldType', props.type)
    console.log('[LIBRARY DRAGSTART] Set fieldType in dataTransfer:', props.type)
}

const handleDragEnd = () => {
    console.log('[LIBRARY DRAGEND] Drag ended')
    isDragging.value = false
    emit('dragend')
}
</script>