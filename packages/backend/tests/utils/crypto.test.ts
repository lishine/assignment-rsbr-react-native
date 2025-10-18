import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from '../../src/utils/crypto.js'

describe('Crypto Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'password123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toContain('.') // Should have salt and hash separated by dot
      expect(hash.length).toBeGreaterThan(32) // Should be reasonably long
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'password123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salts should produce different hashes
    })

    it('should handle different passwords correctly', async () => {
      const password1 = 'password123'
      const password2 = 'password456'
      const hash1 = await hashPassword(password1)
      const hash2 = await hashPassword(password2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'password123'
      const hash = await hashPassword(password)

      const result = await comparePassword(password, hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'password123'
      const wrongPassword = 'wrongpassword'
      const hash = await hashPassword(password)

      const result = await comparePassword(wrongPassword, hash)
      expect(result).toBe(false)
    })

    it('should return false for malformed hash', async () => {
      const password = 'password123'
      const malformedHash = 'invalid'

      const result = await comparePassword(password, malformedHash)
      expect(result).toBe(false)
    })

    it('should return false for incomplete hash', async () => {
      const password = 'password123'
      const incompleteHash = 'onlysalt.'

      const result = await comparePassword(password, incompleteHash)
      expect(result).toBe(false)
    })

    it('should return false for empty hash', async () => {
      const password = 'password123'

      const result = await comparePassword(password, '')
      expect(result).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should work with multiple passwords', async () => {
      const passwords = [
        'simple',
        'complex123!@#',
        'verylongpasswordwithlotsofcharacters123456789',
        'emoji😀password',
        ''
      ]

      for (const password of passwords) {
        const hash = await hashPassword(password)
        const result = await comparePassword(password, hash)
        expect(result).toBe(true)
        
        const wrongResult = await comparePassword(password + 'wrong', hash)
        expect(wrongResult).toBe(false)
      }
    })
  })
})
