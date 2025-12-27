// composables/useClub.ts
// Simple club composable - subdomain from URL, club data from API

interface Club {
  id: number;
  name: string;
  subdomain: string;
}

export function useClub() {
  const config = useRuntimeConfig();

  // Club state
  const club = useState<Club | null>('club', () => null);
  const loading = useState<boolean>('club-loading', () => false);

  // Get subdomain from URL
  const getSubdomain = (): string | null => {
    if (import.meta.server) return null;
    try {
      const host = window.location.hostname;
      const baseDomain = config.public.baseDomain || 'raceyaclub.local';
      if (host.endsWith(`.${baseDomain}`)) {
        const sub = host.replace(`.${baseDomain}`, '');
        if (sub && sub !== 'www' && sub !== 'app' && sub !== 'api') {
          return sub;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const subdomain = computed(() => {
    if (import.meta.server) return null;
    return getSubdomain();
  });
  const isClubSite = computed(() => {
    if (import.meta.server) return false;
    return !!subdomain.value;
  });

  // Fetch club info
  const fetchClub = async () => {
    if (!subdomain.value) return null;
    if (club.value?.subdomain === subdomain.value) return club.value;

    loading.value = true;
    try {
      const { $api } = useNuxtApp();
      const response = await $api.get<any>(`/clubs/by-subdomain/${subdomain.value}`);
      club.value = response.data || response;
      return club.value;
    } catch (error) {
      console.error('Error fetching club:', error);
      club.value = null;
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Check if user is member (from user's clubs array)
  const user = useState<any>('user', () => null);

  const isMember = computed(() => {
    if (import.meta.server) return false;
    const sub = subdomain.value;
    if (!sub || !user.value?.clubs) return false;
    return user.value.clubs.some((c: any) => c.subdomain === sub);
  });

  const role = computed(() => {
    if (import.meta.server) return null;
    const sub = subdomain.value;
    if (!sub || !user.value?.clubs) return null;
    return user.value.clubs.find((c: any) => c.subdomain === sub)?.role || null;
  });

  // Join club
  const joinClub = async () => {
    if (!club.value) return false;
    try {
      const { $api } = useNuxtApp();
      await $api.post(`/clubs/${club.value.id}/join`);
      return true;
    } catch (error) {
      console.error('Error joining club:', error);
      return false;
    }
  };

  return {
    club,
    subdomain,
    isClubSite,
    loading,
    isMember,
    role,
    fetchClub,
    joinClub,
    // Aliases for backwards compatibility
    currentClub: club,
    isLoadingClub: loading,
    isMemberOfCurrentClub: isMember,
    currentClubRole: role,
  };
}
