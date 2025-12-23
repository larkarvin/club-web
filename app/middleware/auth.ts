// middleware/auth.ts
// Protects routes that require authentication

export default defineNuxtRouteMiddleware(async (to) => {
    const { user, fetchUser, isAuthenticated } = useAuth()

    // Only run on client-side
    if (import.meta.server) return

    // Skip auth check for public pages
    const publicPages = ['/login', '/register', '/club-not-found', '/join']
    if (publicPages.includes(to.path)) return

    // Check if user is authenticated
    if (!isAuthenticated.value) {
        // Try to fetch user with existing token
        await fetchUser()

        // If still not authenticated, redirect to login
        if (!isAuthenticated.value) {
            return navigateTo('/login')
        }
    }
})
