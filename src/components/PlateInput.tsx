import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet
} from 'react-native';
import { useTheme, type ThemeColors } from '../theme/colors';

interface PlateInputProps {
  placas: string[];
  selectedPlaca: string | null;
  onSelectPlaca: (placa: string) => void;
  disabled?: boolean;
}

export const PlateInput = ({ selectedPlaca, disabled }: PlateInputProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [searchText, setSearchText] = useState(selectedPlaca || '');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ACCESO RÁPIDO: NÚMERO DE PLACA</Text>

      <View
        style={[
          styles.inputWrapper,
          disabled && styles.inputWrapperDisabled
        ]}
      >
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="Ingresa el ID del vehículo..."
          placeholderTextColor={colors.text.muted}
          value={searchText}
          onChangeText={setSearchText}
          editable={!disabled}
          autoCapitalize="characters"
        />
      </View>

      {!disabled && !selectedPlaca && (
        <Text style={styles.helperText}>Selecciona una placa para habilitar el seguimiento</Text>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: 24,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.input.border,
  },
  inputWrapperFocused: {
    borderColor: colors.input.borderFocus,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperDisabled: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
  },
  inputDisabled: {
    color: colors.text.secondary,
  },
  helperText: {
    marginTop: 10,
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
});