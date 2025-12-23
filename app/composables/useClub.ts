// composables/useClub.ts
import { ref, computed } from 'vue'

interface Club {
    id: number
    name: string
    subdomain: string
    description?: string
    logo?: string
}

interface MembershipStatus {
    isMember: boolean
    role: string | null
    joinedAt?: string
}

// Global state for current club
const currentClub = ref<Club | null>(null)
const membershipStatus = ref<MembershipStatus | null>(null)
const isLoadingClub = ref(false)
const clubError = ref<string | null>(null)

export function useClub() {
    const config = useRuntimeConfig()
    const { $api } = useNuxtApp()

    // Get raw subdomain from current host (includes www, app, etc.)
    const getRawSubdomain = (): string | null => {
        if (import.meta.server) return null

        const host = window.location.hostname
        const baseDomain = config.public.baseDomain || 'raceyaclub.local'

        // Check if we're on a subdomain
        if (host.endsWith(`.${baseDomain}`)) {
            return host.replace(`.${baseDomain}`, '') || null
        }
        return null
    }

    // Get club subdomain (excludes www, app, api)
    const getSubdomain = (): string | null => {
        const raw = getRawSubdomain()
        if (raw && raw !== 'www' && raw !== 'app' && raw !== 'api') {
            return raw
        }
        return null
    }

    const rawSubdomain = computed(() => getRawSubdomain())
    const subdomain = computed(() => getSubdomain())

    // Check if on www subdomain
    const isWwwSubdomain = computed(() => rawSubdomain.value === 'www')

    // Check if on app subdomain
    const isAppSubdomain = computed(() => rawSubdomain.value === 'app')

    // Check if current host is a valid club subdomain (not www, not empty)
    const isClubSubdomain = computed(() => {
        const sub = subdomain.value
        return !!sub && sub !== 'www' && sub !== 'app' && sub !== 'api'
    })

    // Fetch club by subdomain
    const fetchClubBySubdomain = async (subdomainName: string): Promise<Club | null> => {
        isLoadingClub.value = true
        clubError.value = null

        try {
            const response = await $api.get(`/clubs/by-subdomain/${subdomainName}`)
            currentClub.value = response.data || response
            return currentClub.value
        } catch (error: any) {
            console.error('Error fetching club:', error)
            clubError.value = error.data?.message || 'Club not found'
            currentClub.value = null
            return null
        } finally {
            isLoadingClub.value = false
        }
    }

    // Check if user is member of current club
    const checkMembership = async (clubId: number): Promise<MembershipStatus> => {
        try {
            const response = await $api.get(`/clubs/${clubId}/membership`)
            membershipStatus.value = response.data || response
            return membershipStatus.value!
        } catch (error: any) {
            console.error('Error checking membership:', error)
            membershipStatus.value = { isMember: false, role: null }
            return membershipStatus.value
        }
    }

    // Join the current club
    const joinClub = async (clubId: number): Promise<boolean> => {
        try {
            const response = await $api.post(`/clubs/${clubId}/join`)
            membershipStatus.value = {
                isMember: true,
                role: response.role || 'member',
            }
            return true
        } catch (error: any) {
            console.error('Error joining club:', error)
            return false
        }
    }

    // Leave the current club
    const leaveClub = async (clubId: number): Promise<boolean> => {
        try {
            await $api.post(`/clubs/${clubId}/leave`)
            membershipStatus.value = { isMember: false, role: null }
            return true
        } catch (error: any) {
            console.error('Error leaving club:', error)
            return false
        }
    }

    // Clear club state
    const clearClub = () => {
        currentClub.value = null
        membershipStatus.value = null
        clubError.value = null
    }

    return {
        // State
        currentClub,
        membershipStatus,
        isLoadingClub,
        clubError,
        subdomain,
        rawSubdomain,
        isClubSubdomain,
        isWwwSubdomain,
        isAppSubdomain,

        // Methods
        getSubdomain,
        getRawSubdomain,
        fetchClubBySubdomain,
        checkMembership,
        joinClub,
        leaveClub,
        clearClub,
    }
}
