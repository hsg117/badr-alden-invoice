import LZString from 'lz-string'

const SALT = 'bdr-aldn-2025-secure'

export function encodeInvoiceId(id: string): string {
  const salted = id + '|' + SALT
  const compressed = LZString.compressToEncodedURIComponent(salted)
  return compressed
}

export function decodeInvoiceId(encoded: string): string | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded)
    if (!decompressed) return null
    const parts = decompressed.split('|' + SALT)
    if (parts.length !== 2) return null
    return parts[0]
  } catch {
    return null
  }
}

export function getInvoiceUrl(id: string): string {
  const encoded = encodeInvoiceId(id)
  const base = 'https://badr-alden-invoice.vercel.app'
  return base + '/#/invoice/' + encoded
}
