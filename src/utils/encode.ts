export function encodeInvoiceId(id: string): string {
  return btoa(id)
}

export function decodeInvoiceId(encoded: string): string | null {
  try {
    return atob(encoded)
  } catch {
    return null
  }
}

export function getInvoiceUrl(id: string): string {
  const encoded = encodeInvoiceId(id)
  const base = 'https://badr-alden-invoice.vercel.app'
  return base + '/#/invoice/' + encoded
}
