import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen.js';
import { TasksScreen } from '../screens/TasksScreen.js';

export type RootStackParamList = {
  Login: undefined;
  Tasks: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  isSignedIn: boolean;
}

export function AppNavigator({ isSignedIn }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          animationEnabled: true,
        }}
      >
        {!isSignedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Tasks"
            component={TasksScreen}
            options={{
              headerTitle: 'Tasks',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
