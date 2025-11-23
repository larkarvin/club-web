import { defineNuxtPlugin, useRuntimeConfig, useCookie } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    // Create a base $fetch instance
    const $api = $fetch.create({
        baseURL: config.public.api.apiURL,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        },
        onRequest({ options }) {
            // Attach auth token from cookie automatically
            const accessToken = useCookie(config.public.auth?.provider?.token?.cookieName || 'accessToken')
            if (accessToken.value) {
                options.headers = new Headers(options.headers || {})
                options.headers.set('Authorization', `Bearer ${accessToken.value}`)
            }
        },
        onResponseError({ response }) {
            console.error('API Error:', response._data?.message || response)
        },
    })

    // Shortcut methods
    const api = {
        request: $api,
        get: <T>(endpoint: string, headers?: HeadersInit) =>
            $api<T>(endpoint, { method: 'GET', headers }),
        post: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
            $api<T>(endpoint, { method: 'POST', body, headers }),
        put: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
            $api<T>(endpoint, { method: 'PUT', body, headers }),
        patch: <T>(endpoint: string, body?: unknown, headers?: HeadersInit) =>
            $api<T>(endpoint, { method: 'PATCH', body, headers }),
        del: <T>(endpoint: string, headers?: HeadersInit) =>
            $api<T>(endpoint, { method: 'DELETE', headers }),
    }

    return {
        provide: {
            api, // accessible via useNuxtApp().$api
        },
    }
})
