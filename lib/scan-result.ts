export interface ScannableLinkInfo {
  raw: string
  normalized: string
  label: string
  scheme: string
}

const URI_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i
const BLOCKED_SCHEMES = new Set(['javascript:', 'data:', 'blob:'])

export function getScannableLinkInfo(text: string): ScannableLinkInfo | null {
  const value = text.trim()
  if (!value || !URI_SCHEME_PATTERN.test(value) || /\s/.test(value)) return null

  try {
    const parsed = new URL(value)
    const scheme = parsed.protocol.toLowerCase()
    if (BLOCKED_SCHEMES.has(scheme)) return null

    return {
      raw: value,
      normalized: parsed.toString(),
      label: parsed.toString(),
      scheme: scheme.replace(/:$/, ''),
    }
  } catch {
    return null
  }
}

export const getWebLinkInfo = getScannableLinkInfo
