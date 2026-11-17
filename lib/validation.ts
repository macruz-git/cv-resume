export const MAX_CV_SIZE = 10 * 1024 * 1024
export const ALLOWED_POSITIONS = ['crew', 'cashier', 'redemption'] as const
export type ApplicationPosition = (typeof ALLOWED_POSITIONS)[number]
export type ApplicantDetails = { fullName: string; email: string; phone: string; position: string }

export function validateApplicant(details: ApplicantDetails) {
  const fullName = details.fullName.trim()
  const email = details.email.trim().toLowerCase()
  const phone = details.phone.trim()
  const position = details.position.trim()
  const emailAt = email.indexOf('@')
  const validEmail = emailAt > 0 && emailAt === email.lastIndexOf('@') && email.slice(emailAt + 1).includes('.') && !email.split('').some((character) => character.charCodeAt(0) <= 32)
  if (fullName.length < 2 || fullName.length > 120) return { ok: false as const, error: 'Enter a name between 2 and 120 characters.' }
  if (email.length > 254 || !validEmail) return { ok: false as const, error: 'Enter a valid email address.' }
  if (phone.length < 7 || phone.length > 30 || /[^0-9+(). -]/.test(phone)) return { ok: false as const, error: 'Enter a valid phone number.' }
  if (!ALLOWED_POSITIONS.includes(position as ApplicationPosition)) return { ok: false as const, error: 'Choose a valid position.' }
  return { ok: true as const, value: { fullName, email, phone, position: position as ApplicationPosition } }
}

export function hasPdfSignature(bytes: Uint8Array) {
  return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
}
