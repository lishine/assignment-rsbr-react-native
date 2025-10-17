import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { LoginScreen } from '../screens/LoginScreen'
import { TasksScreen } from '../screens/TasksScreen'

export type RootStackParamList = {
	Login: undefined
	Tasks: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

type AppNavigatorProps = {
	isSignedIn: boolean
	onLoginSuccess: () => void
	onLogout: () => void
}

const styles = StyleSheet.create({
	headerLogoutBtn: {
		paddingHorizontal: 11,
		paddingVertical: 7,
		backgroundColor: '#dc3545',
		borderRadius: 4,
		marginRight: 13,
	},
	headerLogoutBtnText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
})

export const AppNavigator = ({ isSignedIn, onLoginSuccess, onLogout }: AppNavigatorProps) => (
	<NavigationContainer key={isSignedIn ? 'signed-in' : 'signed-out'}>
		<Stack.Navigator
			screenOptions={{
				headerShown: true,
				animationEnabled: true,
			}}
		>
			{!isSignedIn ? (
				<Stack.Screen
					name="Login"
					options={{
						headerShown: false,
					}}
				>
					{(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
				</Stack.Screen>
			) : (
				<Stack.Screen
					name="Tasks"
					options={{
						headerTitle: 'Tasks',
						headerRight: () => (
							<TouchableOpacity onPress={onLogout} style={styles.headerLogoutBtn}>
								<Text style={styles.headerLogoutBtnText}>Logout</Text>
							</TouchableOpacity>
						),
					}}
				>
					{(props) => <TasksScreen {...props} onLogout={onLogout} />}
				</Stack.Screen>
			)}
		</Stack.Navigator>
	</NavigationContainer>
)
