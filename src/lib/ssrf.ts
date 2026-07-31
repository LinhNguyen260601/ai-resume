const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

export function assertPublicUrl(input: string): URL {
  const parsed = new URL(input)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs allowed')
  }

  if (BLOCKED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Private URLS not allowed')
  }

  if (/^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(parsed.hostname)) {
    throw new Error('Private IPs not allowed')
  }

  return parsed
}
