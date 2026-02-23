import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHmac } from 'crypto'

function getKey(): Buffer {
  const hex = process.env.VAULT_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('VAULT_ENCRYPTION_KEY must be a 64-character hex string')
  }
  return Buffer.from(hex, 'hex')
}

export function encryptField(plaintext: string): { ciphertext: string; iv: string; authTag: string } {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  }
}

export function decryptField({ ciphertext, iv, authTag }: { ciphertext: string; iv: string; authTag: string }): string {
  const key = getKey()
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(authTag, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

export function generateSalt(): string {
  return randomBytes(16).toString('hex')
}

export function hashPin(pin: string, salt: string): string {
  return scryptSync(pin, salt, 32).toString('hex')
}

export function verifyPin(pin: string, salt: string, hash: string): boolean {
  return hashPin(pin, salt) === hash
}

export const VAULT_COOKIE_NAME = 'vault_session'
export const SESSION_TTL_SECONDS = 900

function getHmacKey(): Buffer {
  const key = process.env.VAULT_ENCRYPTION_KEY!
  return scryptSync(key, 'vault-session-hmac', 32) as Buffer
}

export function createVaultSessionCookie(userId: string, homeId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = Buffer.from(JSON.stringify({ userId, homeId, exp })).toString('base64url')
  const hmacKey = getHmacKey()
  const sig = createHmac('sha256', hmacKey).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyVaultSessionCookie(value: string, userId: string, homeId: string): boolean {
  try {
    const [payload, sig] = value.split('.')
    if (!payload || !sig) return false
    const hmacKey = getHmacKey()
    const expected = createHmac('sha256', hmacKey).update(payload).digest('base64url')
    if (sig !== expected) return false
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (data.userId !== userId || data.homeId !== homeId) return false
    if (Math.floor(Date.now() / 1000) > data.exp) return false
    return true
  } catch {
    return false
  }
}
