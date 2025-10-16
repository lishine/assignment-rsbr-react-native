import React, { useEffect, useState } from 'react';
import { getToken } from './src/utils/storage.js';
import { AppNavigator } from './src/navigation/AppNavigator.js';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  async function bootstrapAsync() {
    try {
      const token = await getToken();
      setIsSignedIn(!!token);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <AppNavigator
      isSignedIn={isSignedIn}
    />
  );
}
