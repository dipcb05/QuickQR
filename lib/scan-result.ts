export interface WebLinkInfo {
  raw: string
  normalized: string
  label: string
}

const BARE_DOMAIN_PATTERN = /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#][^\s]*)?$/i

export function getWebLinkInfo(text: string): WebLinkInfo | null {
  const value = text.trim()
  if (!value) return null

  const normalized = normalizeWebLink(value)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

    return {
      raw: value,
      normalized: parsed.toString(),
      label: parsed.toString().replace(/^https?:\/\//i, ''),
    }
  } catch {
    return null
  }
}

function normalizeWebLink(value: string): string | null {
  if (/^https?:\/\//i.test(value)) return value
  if (BARE_DOMAIN_PATTERN.test(value)) return `https://${value}`
  return null
}
