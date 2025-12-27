// middleware/auth.ts
// Simple auth middleware - just check if token exists

export default defineNuxtRouteMiddleware((to) => {
    // Only run on client-side
    if (import.meta.server) return

    // Check localStorage for token
    const token = localStorage.getItem('auth_token')

    // No token = go to login
    if (!token) {
        return navigateTo('/login')
    }

    // Token exists = let the page handle the rest
})
