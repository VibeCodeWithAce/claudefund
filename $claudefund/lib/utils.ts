export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')

  if (!localPart || !domain) {
    return email
  }

  const visibleChars = Math.min(7, localPart.length)
  return `${localPart.slice(0, visibleChars)}****@${domain}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
