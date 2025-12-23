<!-- pages/forms/new.vue -->
<template>
    <admin-layout>
        <page-breadcrumb pageTitle="Create New Form" />

        <!-- Loading state -->
        <div class="flex flex-col items-center justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-600 dark:text-gray-400">Creating new form...</p>
        </div>
    </admin-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { toast } from 'vue-sonner'
import AdminLayout from '~/components/layout/AdminLayout.vue'
import PageBreadcrumb from '~/components/common/PageBreadcrumb.vue'
import { useApi } from '~/composables/useApi'

const router = useRouter()
const { forms, clubId } = useApi()

// Create form immediately on mount
onMounted(async () => {
    await createForm()
})

const createForm = async () => {
    if (!clubId.value) {
        toast.error('No club selected. Please select a club first.')
        router.push('/clubs')
        return
    }

    try {
        // Create form from default template
        const response = await forms.createFromTemplate('default')

        // Redirect to fields editor
        router.replace({
            path: `/forms/${response.data.id}/fields`,
            query: { club_id: clubId.value }
        })
    } catch (error) {
        console.error('Error creating form:', error)
        toast.error(error.data?.message || 'Failed to create form. Please try again.')

        // Redirect back to forms list
        router.push({
            path: '/forms',
            query: clubId.value ? { club_id: clubId.value } : {}
        })
    }
}
</script>
