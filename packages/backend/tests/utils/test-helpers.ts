import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { createUser } from '../../src/models/index.js'
import { hashPassword } from '../../src/utils/crypto.js'
import { User } from '../../src/types.js'

export async function createTestUser(userData: Partial<User> = {}) {
  const defaultUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123'
  }
  
  const userToCreate = { ...defaultUser, ...userData }
  const hashedPassword = await hashPassword(userToCreate.password)
  
  return await createUser(userToCreate.email, hashedPassword, userToCreate.name)
}

export function createTestToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  })
}

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  } as Request
  
  return req
}

export function createMockResponse() {
  let statusCode = 200
  let responseData: any = {}
  const headers: Record<string, string> = {}

  return {
    status: (code: number) => {
      statusCode = code
      return {
        json: (data: any) => {
          responseData = data
          return Promise.resolve()
        }
      }
    },
    json: (data: any) => {
      responseData = data
      return Promise.resolve()
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
    setHeader: (name: string, value: string) => {
      headers[name] = value
    },
    getHeaders: () => headers
  }
}
