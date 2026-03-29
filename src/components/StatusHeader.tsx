import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, type ThemeColors } from '../theme/colors';

interface StatusHeaderProps {
  isTracking: boolean;
  isConnected?: boolean;
}

export const StatusHeader = ({ isTracking, isConnected = true }: StatusHeaderProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getStatusLabel = () => {
    if (!isConnected) return 'SIN CONEXIÓN';
    if (isTracking) return 'ACTIVO';
    return 'ÓPTIMO';
  };

  const getStatusColor = () => {
    if (!isConnected) return colors.status.warning;
    return colors.primary;
  };

  const getMainTitle = () => {
    if (!isConnected && isTracking) return 'Seguimiento sin conexión';
    if (!isConnected) return 'Esperando conexión';
    if (isTracking) return 'Seguimiento en curso';
    return 'Listo para Iniciar';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusLabel}>
        ESTADO DEL SISTEMA:{' '}
        <Text style={[styles.statusValue, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
      </Text>
      <Text style={styles.mainTitle}>{getMainTitle()}</Text>
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
