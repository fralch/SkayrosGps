import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type ThemeColors } from '../theme/colors';

interface TrackingButtonProps {
  isTracking: boolean;
  isLoading: boolean;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const TrackingButton = ({ 
  isTracking, 
  isLoading, 
  disabled, 
  onStart, 
  onStop 
}: TrackingButtonProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (isTracking) {
    return (
      <TouchableOpacity 
        style={[styles.button, styles.stopButton]}
        onPress={onStop}
      >
        <Text style={styles.buttonText}>DETENER SEGUIMIENTO</Text>
        <Ionicons name="stop-circle" size={20} color={colors.text.inverse} style={styles.icon} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles.startButton,
        disabled && styles.disabledButton
      ]}
      onPress={onStart}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <>
          <Text style={[styles.buttonText, disabled ? styles.disabledText : styles.startText]}>INICIAR SEGUIMIENTO</Text>
          <Ionicons
            name="navigate"
            size={20}
            color={disabled ? colors.text.secondary : colors.text.inverse}
            style={styles.iconStart}
          />
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.status.danger,
  },
  disabledButton: {
    backgroundColor: colors.input.background,
    borderColor: colors.input.border,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  startText: {
    color: colors.text.inverse,
  },
  disabledText: {
    color: colors.text.secondary,
  },
  icon: {
    marginLeft: 8,
  },
  iconStart: {
    marginLeft: 8,
    transform: [{ rotate: '45deg' }],
  }
});
