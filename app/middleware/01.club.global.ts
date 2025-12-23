// middleware/01.club.global.ts
// Global middleware that handles subdomain routing:
// - www.* → redirects to app.*
// - app.* / → redirects to /signup (guest) or /dashboard (auth)
// - club.* / → redirects to /club (club front page)

export default defineNuxtRouteMiddleware(async (to) => {
    const { subdomain, fetchClubBySubdomain, currentClub, isClubSubdomain, isWwwSubdomain, isAppSubdomain } = useClub()
    const { isAuthenticated } = useAuth()
    const config = useRuntimeConfig()

    // Only run on client-side
    if (import.meta.server) return

    // Redirect www to app subdomain
    if (isWwwSubdomain.value) {
        const baseDomain = config.public.baseDomain || 'raceyaclub.local'
        const protocol = window.location.protocol
        const appUrl = `${protocol}//app.${baseDomain}${to.fullPath}`
        return navigateTo(appUrl, { external: true })
    }

    // Handle app subdomain: redirect / based on auth status
    if (isAppSubdomain.value) {
        if (to.path === '/') {
            if (isAuthenticated.value) {
                return navigateTo('/dashboard')
            } else {
                return navigateTo('/signup')
            }
        }
        return
    }

    const currentSubdomain = subdomain.value

    // If not on a club subdomain, skip this middleware
    if (!isClubSubdomain.value) return

    // If club already loaded for this subdomain, skip fetch
    if (currentClub.value?.subdomain === currentSubdomain) {
        return
    }

    // Fetch club data
    const club = await fetchClubBySubdomain(currentSubdomain!)

    // If club not found, redirect to club-not-found page
    if (!club) {
        // Avoid infinite redirect loop
        if (to.path !== '/club-not-found') {
            return navigateTo('/club-not-found')
        }
    }
})
