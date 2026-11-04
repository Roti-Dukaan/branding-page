const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
