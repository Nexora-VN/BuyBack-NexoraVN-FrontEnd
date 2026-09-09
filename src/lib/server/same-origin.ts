const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function parseOrigin(value: string): string | undefined {
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function requestHostOrigin(requestUrl: URL, host: string | null): string | undefined {
  if (!host) return undefined;

  return parseOrigin(`${requestUrl.protocol}//${host.trim()}`);
}

/**
 * Protect cookie-authenticated mutations from cross-site requests.
 *
 * In a standalone Next.js container, request.url can contain the internal
 * hostname even though the browser's Origin and Host headers contain the
 * public address. Both forms are accepted, as is the configured public site.
 */
export function isCrossOriginMutation(request: Request): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return false;

  const originHeader = request.headers.get("origin");
  if (!originHeader) return false;

  const origin = parseOrigin(originHeader);
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set<string>([requestUrl.origin]);
  const hostOrigin = requestHostOrigin(requestUrl, request.headers.get("host"));
  const configuredSiteOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? parseOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined;

  if (hostOrigin) allowedOrigins.add(hostOrigin);
  if (configuredSiteOrigin) allowedOrigins.add(configuredSiteOrigin);

  return !allowedOrigins.has(origin);
}
