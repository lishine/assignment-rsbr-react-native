import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 4,
  },
  text: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
});
