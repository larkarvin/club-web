// composables/useApi.js
import { computed } from 'vue'

export function useApi() {
    const config = useRuntimeConfig()
    const route = useRoute()

    // Get club_id from route query or params
    const clubId = computed(() => {
        return route.query.club_id || route.params.club_id || null
    })

    // Base URL for API
    const baseUrl = computed(() => config.public.apiBase || '/api/v1')

    // Build URL with club_id query param
    const buildUrl = (path, params = {}) => {
        const url = new URL(`${baseUrl.value}${path}`, window.location.origin)

        // Add club_id if available
        if (clubId.value) {
            url.searchParams.set('club_id', clubId.value)
        }

        // Add additional params
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value)
            }
        })

        return url.toString()
    }

    // API methods
    const api = {
        get: async (path, params = {}) => {
            const response = await $fetch(buildUrl(path, params), {
                method: 'GET'
            })
            return response
        },

        post: async (path, body = {}, params = {}) => {
            const response = await $fetch(buildUrl(path, params), {
                method: 'POST',
                body
            })
            return response
        },

        put: async (path, body = {}, params = {}) => {
            const response = await $fetch(buildUrl(path, params), {
                method: 'PUT',
                body
            })
            return response
        },

        patch: async (path, body = {}, params = {}) => {
            const response = await $fetch(buildUrl(path, params), {
                method: 'PATCH',
                body
            })
            return response
        },

        delete: async (path, params = {}) => {
            const response = await $fetch(buildUrl(path, params), {
                method: 'DELETE'
            })
            return response
        }
    }

    // Form-specific API methods
    const forms = {
        // Create a new form
        create: async (data) => {
            return await api.post('/forms', data)
        },

        // Create from template (default template)
        createFromTemplate: async (template = 'default') => {
            return await api.post('/forms/from-template', { template })
        },

        // Get all forms for the club
        list: async () => {
            return await api.get('/forms')
        },

        // Get single form
        get: async (formId) => {
            return await api.get(`/forms/${formId}`)
        },

        // Update form (full)
        update: async (formId, data) => {
            return await api.put(`/forms/${formId}`, data)
        },

        // Update form settings only
        updateSettings: async (formId, settings) => {
            return await api.patch(`/forms/${formId}/settings`, settings)
        },

        // Delete form
        delete: async (formId) => {
            return await api.delete(`/forms/${formId}`)
        }
    }

    // Field-specific API methods
    const fields = {
        // Add field to form
        create: async (formId, fieldData) => {
            return await api.post(`/forms/${formId}/fields`, fieldData)
        },

        // Update field
        update: async (formId, fieldId, fieldData) => {
            return await api.put(`/forms/${formId}/fields/${fieldId}`, fieldData)
        },

        // Delete field
        delete: async (formId, fieldId) => {
            return await api.delete(`/forms/${formId}/fields/${fieldId}`)
        },

        // Reorder fields
        reorder: async (formId, fieldOrder) => {
            return await api.patch(`/forms/${formId}/fields/reorder`, { order: fieldOrder })
        }
    }

    return {
        clubId,
        api,
        forms,
        fields
    }
}
