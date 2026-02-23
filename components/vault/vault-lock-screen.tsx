'use client'

import { useState, useRef } from 'react'
import { Lock, Loader2 } from 'lucide-react'

interface VaultLockScreenProps {
  homeId: string
  hasPinSet: boolean
  onUnlocked: () => void
}

export default function VaultLockScreen({ homeId, hasPinSet, onUnlocked }: VaultLockScreenProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Set-PIN flow for first visit
  const [settingPin, setSettingPin] = useState(!hasPinSet)
  const [newPin, setNewPin] = useState(['', '', '', ''])
  const [newPinRefs] = useState<(HTMLInputElement | null)[]>([null, null, null, null])

  function handlePinDigit(index: number, value: string, pinArr: string[], setPinArr: (p: string[]) => void, refs: (HTMLInputElement | null)[]) {
    if (!/^\d?$/.test(value)) return
    const updated = [...pinArr]
    updated[index] = value
    setPinArr(updated)
    if (value && index < 3) {
      refs[index + 1]?.focus()
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent, pinArr: string[], setPinArr: (p: string[]) => void, refs: (HTMLInputElement | null)[]) {
    if (e.key === 'Backspace' && !pinArr[index] && index > 0) {
      refs[index - 1]?.focus()
    }
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault()
    const pinStr = newPin.join('')
    if (pinStr.length !== 4) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/homes/${homeId}/vault/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinStr }),
    })

    if (!res.ok) {
      setError('Failed to set PIN. Please try again.')
      setLoading(false)
      return
    }

    // Auto-unlock after setting PIN
    const unlockRes = await fetch(`/api/homes/${homeId}/vault/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'pin', pin: pinStr }),
    })

    setLoading(false)
    if (unlockRes.ok) {
      onUnlocked()
    } else {
      setError('PIN set but unlock failed. Please refresh and try again.')
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let body: object
    if (usePassword) {
      body = { method: 'password', password }
    } else {
      body = { method: 'pin', pin: pin.join('') }
    }

    const res = await fetch(`/api/homes/${homeId}/vault/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      onUnlocked()
    } else {
      const data = await res.json()
      setError(data.error || 'Unlock failed')
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  if (settingPin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-[#dce4ef] flex items-center justify-center mb-4">
          <Lock size={24} className="text-[#5B6C8F]" />
        </div>
        <h2 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">Set Your Vault PIN</h2>
        <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
          Create a 4-digit PIN to protect your vault. You&apos;ll need it every time you access the vault.
        </p>
        <form onSubmit={handleSetPin} className="w-full max-w-xs">
          <div className="flex gap-3 justify-center mb-6">
            {newPin.map((digit, i) => (
              <input
                key={i}
                ref={el => { newPinRefs[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handlePinDigit(i, e.target.value, newPin, setNewPin, newPinRefs)}
                onKeyDown={e => handlePinKeyDown(i, e, newPin, setNewPin, newPinRefs)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-[#5B6C8F] border-[#C8BFB2]"
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || newPin.join('').length !== 4}
            className="w-full flex items-center justify-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Setting up…' : 'Set PIN & Unlock'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Lock size={24} className="text-slate-600" />
      </div>
      <h2 className="font-playfair text-xl font-bold text-[#2F3437] mb-2">Vault Locked</h2>
      <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
        {usePassword ? 'Enter your account password to unlock.' : 'Enter your 4-digit PIN to access the vault.'}
      </p>

      <form onSubmit={handleUnlock} className="w-full max-w-xs">
        {usePassword ? (
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Account password"
              autoFocus
              className="w-full px-4 py-3 border-2 border-[#C8BFB2] rounded-xl focus:outline-none focus:border-[#5B6C8F] text-[#2F3437]"
            />
          </div>
        ) : (
          <div className="flex gap-3 justify-center mb-6">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handlePinDigit(i, e.target.value, pin, setPin, inputRefs.current)}
                onKeyDown={e => handlePinKeyDown(i, e, pin, setPin, inputRefs.current)}
                autoFocus={i === 0}
                className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-[#5B6C8F] border-[#C8BFB2]"
              />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || (!usePassword && pin.join('').length !== 4) || (usePassword && !password)}
          className="w-full flex items-center justify-center gap-2 bg-[#5B6C8F] hover:bg-[#4a5c77] disabled:bg-[#7a8fa8] text-white font-semibold py-3 rounded-xl transition-colors mb-3"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Unlocking…' : 'Unlock Vault'}
        </button>

        <button
          type="button"
          onClick={() => { setUsePassword(!usePassword); setError(''); setPin(['', '', '', '']); setPassword('') }}
          className="w-full text-sm text-slate-500 hover:text-[#5B6C8F] transition-colors text-center"
        >
          {usePassword ? 'Use PIN instead' : 'Use password instead'}
        </button>
      </form>
    </div>
  )
}
