import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

export async function saveUser(user: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

export async function getUser(): Promise<any | null> {
  try {
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

export async function removeUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
}

export async function clearAuth(): Promise<void> {
  await removeToken();
  await removeUser();
}
