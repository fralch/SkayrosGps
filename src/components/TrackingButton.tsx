import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

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

  if (isTracking) {
    return (
      <TouchableOpacity 
        style={[styles.button, styles.stopButton]}
        onPress={onStop}
      >
        <Text style={styles.buttonText}>STOP TRACKING</Text>
        <Ionicons name="stop-circle" size={20} color="#FFFFFF" style={styles.icon} />
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
    >
      {isLoading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <>
          <Text style={[styles.buttonText, styles.startText]}>START TRACKING</Text>
          <Ionicons name="navigate" size={20} color="#000000" style={styles.iconStart} />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.input.border,
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  startText: {
    color: '#000000', // Dark text on bright green for contrast
  },
  icon: {
    marginLeft: 8,
  },
  iconStart: {
    marginLeft: 8,
    transform: [{ rotate: '45deg' }],
  }
});
