import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { getInvoiceUrl } from '../utils/encode'

interface InvoiceQRProps {
  invoiceId: string
  size?: number
}

function InvoiceQR({ invoiceId, size = 120 }: InvoiceQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const url = getInvoiceUrl(invoiceId)
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: '#1a56db', light: '#ffffff' },
    })
  }, [invoiceId, size])

  return <canvas ref={canvasRef} width={size} height={size} />
}

export default InvoiceQR
