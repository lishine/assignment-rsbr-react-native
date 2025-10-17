import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { AppNavigator } from './src/navigation/AppNavigator'
import { getToken } from './src/utils/storage'

const App = () => {
	const [isSignedIn, setIsSignedIn] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		console.log('App component mounted')
		bootstrapAsync()
	}, [])

	const bootstrapAsync = async () => {
		try {
			console.log('Checking for token...')
			const token = await getToken()
			console.log('Token:', token ? 'found' : 'not found')
			setIsSignedIn(!!token)
		} catch (error) {
			console.error('Bootstrap error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleLoginSuccess = useCallback(() => {
		console.log('Login success')
		setIsSignedIn(true)
	}, [])

	const handleLogout = useCallback(() => {
		console.log('Logout')
		setIsSignedIn(false)
	}, [])

	console.log('App render - isLoading:', isLoading, 'isSignedIn:', isSignedIn)

	if (isLoading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.text}>Loading...</Text>
			</View>
		)
	}

	return <AppNavigator isSignedIn={isSignedIn} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	text: {
		marginTop: 10,
		fontSize: 16,
		color: '#666',
	},
})

export default App
