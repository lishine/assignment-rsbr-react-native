import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

/**
 * Hash a password using Node.js built-in scrypt
 * @param password - Plain text password
 * @returns Hashed password in format: salt.hash
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex')
	const buf = (await scryptAsync(password, salt, 64)) as Buffer
	return `${salt}.${buf.toString('hex')}`
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password in format: salt.hash
 * @returns True if password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
	const [salt, storedHash] = hash.split('.')
	if (!salt || !storedHash) {
		return false
	}
	const buf = (await scryptAsync(password, salt, 64)) as Buffer
	const hashBuffer = Buffer.from(storedHash, 'hex')
	return timingSafeEqual(hashBuffer as any, buf as any)
}
