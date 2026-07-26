export function sanitizePhoneInput(value) {
  return (value || '').replace(/\D/g, '').slice(0, 10)
}

export function isValidPhoneNumber(value) {
  return /^\d{10}$/.test(sanitizePhoneInput(value))
}
