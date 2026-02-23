import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { GettingStartedPDF } from '@/components/guide/getting-started-pdf'

// Public route — no auth required. This is a general product guide.
export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(GettingStartedPDF) as any
  const buffer = await renderToBuffer(element)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="homefile-getting-started.pdf"',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
