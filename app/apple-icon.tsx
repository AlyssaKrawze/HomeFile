import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0d9488',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '40px',
      }}
    >
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: 110, fontFamily: 'Arial' }}>H</span>
    </div>,
    { ...size }
  )
}
