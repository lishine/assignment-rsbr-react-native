import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen } from '../screens/LoginScreen'
import { TasksScreen } from '../screens/TasksScreen'

export type RootStackParamList = {
	Login: undefined
	Tasks: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

interface AppNavigatorProps {
	isSignedIn: boolean
	onLoginSuccess: () => void
	onLogout: () => void
}

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
					}}
				>
					{(props) => <TasksScreen {...props} onLogout={onLogout} />}
				</Stack.Screen>
			)}
		</Stack.Navigator>
	</NavigationContainer>
)
