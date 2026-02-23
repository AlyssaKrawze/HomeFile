import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0d9488',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '22%',
      }}
    >
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20, fontFamily: 'Arial' }}>H</span>
    </div>,
    { ...size }
  )
}
