// composables/useApi.js
// Simple API wrapper - subdomain is handled by the API plugin

export function useApi() {
    // Forms API
    const forms = {
        list: async () => {
            const { $api } = useNuxtApp()
            return await $api.get('/forms')
        },

        get: async (formId) => {
            const { $api } = useNuxtApp()
            return await $api.get(`/forms/${formId}`)
        },

        create: async (data) => {
            const { $api } = useNuxtApp()
            return await $api.post('/forms', data)
        },

        createFromTemplate: async (template = 'default') => {
            const { $api } = useNuxtApp()
            return await $api.post('/forms/from-template', { template })
        },

        update: async (formId, data) => {
            const { $api } = useNuxtApp()
            return await $api.put(`/forms/${formId}`, data)
        },

        updateSettings: async (formId, settings) => {
            const { $api } = useNuxtApp()
            return await $api.patch(`/forms/${formId}/settings`, settings)
        },

        delete: async (formId) => {
            const { $api } = useNuxtApp()
            return await $api.delete(`/forms/${formId}`)
        }
    }

    // Fields API
    const fields = {
        create: async (formId, fieldData) => {
            const { $api } = useNuxtApp()
            return await $api.post(`/forms/${formId}/fields`, fieldData)
        },

        update: async (formId, fieldId, fieldData) => {
            const { $api } = useNuxtApp()
            return await $api.put(`/forms/${formId}/fields/${fieldId}`, fieldData)
        },

        delete: async (formId, fieldId) => {
            const { $api } = useNuxtApp()
            return await $api.delete(`/forms/${formId}/fields/${fieldId}`)
        },

        reorder: async (formId, fieldOrder) => {
            const { $api } = useNuxtApp()
            return await $api.patch(`/forms/${formId}/fields/reorder`, { order: fieldOrder })
        }
    }

    return { forms, fields }
}
