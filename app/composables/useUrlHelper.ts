/**
 * URL Helper Composable
 * Builds URLs for different subdomains (app, club, www)
 */

export const useUrlHelper = () => {
  const config = useRuntimeConfig();

  /**
   * Build a club URL
   * @param subdomain - Club subdomain
   * @param path - Path to append (default: '/')
   * @returns Full club URL
   *
   * Example: buildClubUrl('myclub', '/dashboard')
   * Returns: http://myclub.raceyaclub.local/dashboard
   */
  const buildClubUrl = (subdomain: string, path: string = '/'): string => {
    const protocol = config.public.protocol || 'http';
    const baseDomain = config.public.baseDomain || 'raceyaclub.local';
    const port = config.public.port ? `:${config.public.port}` : '';

    return `${protocol}://${subdomain}.${baseDomain}${port}${path}`;
  };

  /**
   * Build an app URL
   * @param path - Path to append (default: '/')
   * @returns Full app URL
   *
   * Example: buildAppUrl('/signup')
   * Returns: http://app.raceyaclub.local/signup
   */
  const buildAppUrl = (path: string = '/'): string => {
    const protocol = config.public.protocol || 'http';
    const baseDomain = config.public.baseDomain || 'raceyaclub.local';
    const port = config.public.port ? `:${config.public.port}` : '';

    return `${protocol}://app.${baseDomain}${port}${path}`;
  };

  /**
   * Build www URL
   * @param path - Path to append (default: '/')
   * @returns Full www URL
   *
   * Example: buildWwwUrl('/about')
   * Returns: http://www.raceyaclub.local/about
   */
  const buildWwwUrl = (path: string = '/'): string => {
    return config.public.wwwUrl + (path === '/' ? '' : path);
  };

  /**
   * Redirect to club subdomain
   * @param subdomain - Club subdomain
   * @param path - Path to redirect to
   */
  const redirectToClub = (subdomain: string, path: string = '/') => {
    const url = buildClubUrl(subdomain, path);
    window.location.href = url;
  };

  /**
   * Redirect to app subdomain
   * @param path - Path to redirect to
   */
  const redirectToApp = (path: string = '/') => {
    const url = buildAppUrl(path);
    window.location.href = url;
  };

  /**
   * Redirect to www
   * @param path - Path to redirect to
   */
  const redirectToWww = (path: string = '/') => {
    const url = buildWwwUrl(path);
    window.location.href = url;
  };

  return {
    buildClubUrl,
    buildAppUrl,
    buildWwwUrl,
    redirectToClub,
    redirectToApp,
    redirectToWww,
  };
};
