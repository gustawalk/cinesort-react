import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password.
 * @param password - The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
}

/**
 * Compares a plain-text password with a stored hash.
 * @param enteredPassword - Password entered by the user
 * @param storedHash - Hash stored in the database
 * @returns True if they match, false otherwise
 */
export async function compareHashPassword(
  enteredPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    return isMatch;
  } catch (err) {
    console.error("Error comparing password:", err);
    throw err;
  }
}
