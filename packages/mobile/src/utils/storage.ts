import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { User } from '../types'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const isWeb = Platform.OS === 'web'

export async function saveToken(token: string): Promise<void> {
	try {
		if (isWeb) {
			localStorage.setItem(TOKEN_KEY, token)
		} else {
			await SecureStore.setItemAsync(TOKEN_KEY, token)
		}
	} catch (error) {
		console.error('Failed to save token:', error)
	}
}

export async function getToken(): Promise<string | null> {
	try {
		if (isWeb) {
			return localStorage.getItem(TOKEN_KEY)
		} else {
			return await SecureStore.getItemAsync(TOKEN_KEY)
		}
	} catch (error) {
		console.error('Failed to get token:', error)
		return null
	}
}

export async function removeToken(): Promise<void> {
	try {
		if (isWeb) {
			localStorage.removeItem(TOKEN_KEY)
		} else {
			await SecureStore.deleteItemAsync(TOKEN_KEY)
		}
	} catch (error) {
		console.error('Failed to remove token:', error)
	}
}

export async function saveUser(user: User): Promise<void> {
	try {
		if (isWeb) {
			localStorage.setItem(USER_KEY, JSON.stringify(user))
		} else {
			await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
		}
	} catch (error) {
		console.error('Failed to save user:', error)
	}
}

export async function getUser(): Promise<User | null> {
	try {
		const userString = isWeb ? localStorage.getItem(USER_KEY) : await SecureStore.getItemAsync(USER_KEY)
		return userString ? JSON.parse(userString) : null
	} catch (error) {
		console.error('Failed to get user:', error)
		return null
	}
}

export async function removeUser(): Promise<void> {
	try {
		if (isWeb) {
			localStorage.removeItem(USER_KEY)
		} else {
			await SecureStore.deleteItemAsync(USER_KEY)
		}
	} catch (error) {
		console.error('Failed to remove user:', error)
	}
}

export async function clearAuth(): Promise<void> {
	try {
		await removeToken()
		await removeUser()
	} catch (error) {
		console.error('Failed to clear auth:', error)
	}
}
