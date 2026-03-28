import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StatusHeaderProps {
  isTracking: boolean;
}

export const StatusHeader = ({ isTracking }: StatusHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.statusLabel}>
        SYSTEM STATUS: <Text style={styles.statusValue}>{isTracking ? 'ACTIVE' : 'OPTIMAL'}</Text>
      </Text>
      <Text style={styles.mainTitle}>
        {isTracking ? 'Tracking in Progress' : 'Ready to Dispatch'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statusValue: {
    color: colors.text.secondary,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});
