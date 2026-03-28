import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, type ThemeColors } from '../theme/colors';

interface StatusHeaderProps {
  isTracking: boolean;
}

export const StatusHeader = ({ isTracking }: StatusHeaderProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.statusLabel}>
        ESTADO DEL SISTEMA: <Text style={styles.statusValue}>{isTracking ? 'ACTIVO' : 'ÓPTIMO'}</Text>
      </Text>
      <Text style={styles.mainTitle}>
        {isTracking ? 'Seguimiento en curso' : 'Listo para Iniciar'}
      </Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  statusValue: {
    color: colors.primary,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});
