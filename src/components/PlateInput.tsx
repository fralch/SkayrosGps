import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Keyboard
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface PlateInputProps {
  placas: string[];
  selectedPlaca: string | null;
  onSelectPlaca: (placa: string) => void;
  disabled?: boolean;
}

export const PlateInput = ({ placas, selectedPlaca, onSelectPlaca, disabled }: PlateInputProps) => {
  const [searchText, setSearchText] = useState(selectedPlaca || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredPlacas = placas.filter(p => 
    p.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (item: string) => {
    setSearchText(item);
    onSelectPlaca(item);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>QUICK ENTRY: PLATE NUMBER</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder="Enter vehicle ID..."
          placeholderTextColor={colors.text.muted}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          editable={!disabled}
        />
        <TouchableOpacity style={styles.iconButton} disabled={disabled}>
          <Ionicons name="qr-code-outline" size={20} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      {showSuggestions && !disabled && searchText.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredPlacas}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron placas</Text>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '600',
    letterSpacing: 1,
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
  input: {
    flex: 1,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    padding: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 85,
    left: 0,
    right: 0,
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 20,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.input.border,
  },
  suggestionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    color: colors.text.muted,
  },
});
