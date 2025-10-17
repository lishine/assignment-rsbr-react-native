import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { ErrorMessage } from '../components/ErrorMessage'
import { login, register } from '../services/api'
import { saveToken, saveUser } from '../utils/storage'

interface LoginScreenProps {
	onLoginSuccess?: () => void
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
	const [isRegister, setIsRegister] = useState(false)
	const [email, setEmail] = useState('test1@example.com')
	const [password, setPassword] = useState('password123')
	const [name, setName] = useState('Test User')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleLoginPress = async () => {
		console.log('handleLoginPress')
		if (!email || !password) {
			setError('Please fill in all fields')
			return
		}

		setLoading(true)
		setError('')

		try {
			const response = await login({ email, password })
			console.log({ response: response })
			await saveToken(response.token)
			await saveUser(response.user)
			onLoginSuccess?.()
		} catch (err: any) {
			setError(err.data?.error || 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	const handleRegisterPress = async () => {
		if (!email || !password || !name) {
			setError('Please fill in all fields')
			return
		}

		if (password.length < 6) {
			setError('Password must be at least 6 characters')
			return
		}

		setLoading(true)
		setError('')

		try {
			const response = await register({ email, password, name })
			await saveToken(response.token)
			await saveUser(response.user)
			onLoginSuccess?.()
		} catch (err: any) {
			setError(err.data?.error || 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	const handleTestLogin = async () => {
		setEmail('test1@example.com')
		setPassword('password123')
		setIsRegister(false)
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Task Manager</Text>
				<Text style={styles.subtitle}>{isRegister ? 'Create an account' : 'Sign in to your account'}</Text>
			</View>

			<View style={styles.form}>
				<ErrorMessage message={error} />

				<TextInput
					style={styles.input}
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					editable={!loading}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				{isRegister && (
					<TextInput
						style={styles.input}
						placeholder="Full Name"
						value={name}
						onChangeText={setName}
						editable={!loading}
					/>
				)}

				<TextInput
					style={styles.input}
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					editable={!loading}
					secureTextEntry
				/>

				<TouchableOpacity
					style={[styles.button, loading && styles.buttonDisabled]}
					onPress={isRegister ? handleRegisterPress : handleLoginPress}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.buttonText}>{isRegister ? 'Sign Up' : 'Sign In'}</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => {
						setIsRegister(!isRegister)
						setError('')
					}}
					disabled={loading}
				>
					<Text style={styles.link}>
						{isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
					</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.demoSection}>
				<Text style={styles.demoTitle}>Demo Credentials</Text>
				<TouchableOpacity onPress={handleTestLogin} disabled={loading}>
					<Text style={styles.demoText}>
						Email: test1@example.com{'\n'}
						Password: password123
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 40,
		backgroundColor: '#f8f8f8',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#000',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
	},
	form: {
		paddingHorizontal: 16,
		paddingTop: 40,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		marginBottom: 16,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	button: {
		backgroundColor: '#007AFF',
		borderRadius: 8,
		paddingVertical: 12,
		alignItems: 'center',
		marginVertical: 16,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	link: {
		color: '#007AFF',
		textAlign: 'center',
		marginTop: 12,
		fontSize: 14,
	},
	demoSection: {
		marginHorizontal: 16,
		marginTop: 40,
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
	},
	demoTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#000',
		marginBottom: 8,
	},
	demoText: {
		fontSize: 13,
		color: '#666',
		lineHeight: 20,
	},
})
