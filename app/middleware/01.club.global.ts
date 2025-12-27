// middleware/01.club.global.ts
// Global middleware - runs on client only

export default defineNuxtRouteMiddleware((to) => {
  // Only run on client-side
  if (import.meta.server) return

  const config = useRuntimeConfig()
  const baseDomain = config.public.baseDomain || 'raceyaclub.local'
  const host = window.location.hostname

  // Get subdomain
  let subdomain: string | null = null
  if (host.endsWith(`.${baseDomain}`)) {
    subdomain = host.replace(`.${baseDomain}`, '')
  }

  // Redirect www to app subdomain
  if (subdomain === 'www') {
    const protocol = window.location.protocol
    const appUrl = `${protocol}//app.${baseDomain}${to.fullPath}`
    return navigateTo(appUrl, { external: true })
  }

  // Handle app subdomain: redirect / based on auth status
  if (subdomain === 'app' && to.path === '/') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      return navigateTo('/dashboard')
    } else {
      return navigateTo('/signup')
    }
  }
})
