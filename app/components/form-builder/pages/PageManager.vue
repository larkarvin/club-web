<!-- app/components/form-builder/pages/PageManager.vue -->
<template>
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-4">
        <div class="border-b border-stroke px-4 py-3 dark:border-strokedark flex items-center justify-between">
            <h3 class="font-medium text-black dark:text-white text-sm">Pages</h3>
            <button
                @click="handleAddPage"
                class="text-brand-500 hover:text-brand-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Add page"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
        <div ref="pageListRef" class="p-3 space-y-2">
            <div
                v-for="(page, index) in pages"
                :key="page.id"
                :data-id="page.id"
                class="p-3 rounded-lg cursor-pointer border transition-colors"
                :class="currentPageId === page.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="handleSelectPage(page.id)"
            >
                <div class="flex items-center gap-2">
                    <!-- Drag handle -->
                    <div
                        v-if="pages.length > 1"
                        class="page-drag-handle cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                        @click.stop
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                        </svg>
                    </div>

                    <!-- Editable title -->
                    <input
                        v-if="editingPageId === page.id"
                        ref="titleInput"
                        v-model="editingTitle"
                        type="text"
                        class="flex-1 text-sm font-medium bg-transparent border-b border-brand-500 outline-none text-black dark:text-white"
                        @blur="savePageTitle(page.id)"
                        @keyup.enter="savePageTitle(page.id)"
                        @keyup.escape="cancelEditTitle"
                        @click.stop
                    />
                    <span
                        v-else
                        class="flex-1 text-sm font-medium text-black dark:text-white truncate"
                        @dblclick.stop="startEditTitle(page)"
                    >
                        {{ page.title || `Step ${index + 1}` }}
                    </span>

                    <!-- Delete button -->
                    <button
                        v-if="pages.length > 1"
                        @click.stop="handleDeletePage(page.id)"
                        class="text-gray-400 hover:text-error-500 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                        title="Delete page"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400" :class="{ 'ml-6': pages.length > 1 }">
                    {{ getFieldCount(page.id) }} {{ getFieldCount(page.id) === 1 ? 'field' : 'fields' }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps({
    pages: {
        type: Array,
        required: true
    },
    currentPageId: {
        type: [Number, String],
        default: null
    },
    getFieldCount: {
        type: Function,
        required: true
    }
})

const emit = defineEmits(['add-page', 'select-page', 'delete-page', 'update-page', 'reorder-pages'])

// Template ref for sortable container
const pageListRef = ref(null)
let sortableInstance = null

// Title editing state
const editingPageId = ref(null)
const editingTitle = ref('')
const titleInput = ref(null)

// Delete confirmation state
const pendingDeletePageId = ref(null)

// Initialize SortableJS
const initSortable = async () => {
    if (sortableInstance) {
        sortableInstance.destroy()
    }

    if (!pageListRef.value || props.pages.length <= 1) return

    try {
        const Sortable = (await import('sortablejs')).default
        sortableInstance = Sortable.create(pageListRef.value, {
            handle: '.page-drag-handle',
            animation: 200,
            ghostClass: 'page-ghost',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt
                if (oldIndex !== newIndex) {
                    emit('reorder-pages', oldIndex, newIndex)
                }
            }
        })
    } catch (error) {
        console.error('Failed to load SortableJS:', error)
    }
}

// Initialize on mount
onMounted(async () => {
    await nextTick()
    if (props.pages.length > 1) {
        initSortable()
    }
})

// Watch for pages changes to reinitialize sortable
watch(() => props.pages.length, async (newLen, oldLen) => {
    await nextTick()
    if (newLen > 1) {
        initSortable()
    } else if (sortableInstance) {
        sortableInstance.destroy()
        sortableInstance = null
    }
})

// Cleanup on unmount
onBeforeUnmount(() => {
    if (sortableInstance) {
        sortableInstance.destroy()
        sortableInstance = null
    }
})

const handleAddPage = () => {
    emit('add-page')
}

const handleSelectPage = (pageId) => {
    emit('select-page', pageId)
}

const handleDeletePage = (pageId) => {
    // If already pending deletion for this page, execute it
    if (pendingDeletePageId.value === pageId) {
        emit('delete-page', pageId)
        pendingDeletePageId.value = null
        return
    }

    // Find page title for message
    const page = props.pages.find(p => p.id === pageId)
    const pageTitle = page?.title || 'this page'

    // Set pending and show confirmation toast
    pendingDeletePageId.value = pageId
    toast.warning(`Delete "${pageTitle}"?`, {
        description: 'Fields will be moved to the first page.',
        cancel: {
            label: 'Cancel',
            onClick: () => {
                pendingDeletePageId.value = null
            }
        },
        action: {
            label: 'Delete',
            onClick: () => {
                emit('delete-page', pageId)
                pendingDeletePageId.value = null
            }
        },
        duration: 8000,
        classNames: {
            actionButton: '!bg-meta-1 !text-white hover:!bg-red-600',
        },
        onDismiss: () => {
            pendingDeletePageId.value = null
        }
    })
}

const startEditTitle = async (page) => {
    editingPageId.value = page.id
    editingTitle.value = page.title
    await nextTick()
    titleInput.value?.[0]?.focus()
    titleInput.value?.[0]?.select()
}

const savePageTitle = (pageId) => {
    if (editingTitle.value.trim()) {
        emit('update-page', pageId, { title: editingTitle.value.trim() })
    }
    editingPageId.value = null
    editingTitle.value = ''
}

const cancelEditTitle = () => {
    editingPageId.value = null
    editingTitle.value = ''
}
</script>

<style scoped>
.page-ghost {
    opacity: 0.5;
    background: #dbeafe;
    border-radius: 0.5rem;
}
</style>
