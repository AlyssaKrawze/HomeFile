import { ImageResponse } from 'next/og'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d9488',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '115px',
        }}
      >
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 320, fontFamily: 'Arial' }}>H</span>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
