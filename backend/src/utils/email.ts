/**
 * Validates a email via regex
 * @param email - Request email
 * @returns Return true if the email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return emailPattern.test(email);
}
