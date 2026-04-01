import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTheme, type ThemeColors } from '../theme/colors';

interface CamionPlacaSuggestion {
  id: number;
  placa: string;
}

interface PlateInputProps {
  selectedPlaca: string | null;
  onSelectPlaca: (placa: string | null) => void;
  suggestions: CamionPlacaSuggestion[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  errorMessage: string | null;
  onSearch: (query: string) => Promise<void>;
  onLoadMore: () => Promise<void>;
  disabled?: boolean;
}

export const PlateInput = ({
  selectedPlaca,
  onSelectPlaca,
  suggestions,
  isLoading,
  isLoadingMore,
  hasMore,
  errorMessage,
  onSearch,
  onLoadMore,
  disabled,
}: PlateInputProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [searchText, setSearchText] = useState(selectedPlaca || '');
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchText(selectedPlaca || '');
  }, [selectedPlaca]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(searchText);
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [disabled, onSearch, searchText]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowSuggestions = !disabled && isFocused && searchText.trim().length > 0;

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
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            setIsFocused(true);
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
          onChangeText={(text) => {
            setSearchText(text);
            const normalized = text.trim();
            onSelectPlaca(normalized.length > 0 ? normalized : null);
          }}
          editable={!disabled}
          autoCapitalize="characters"
        />
      </View>

      {shouldShowSuggestions && (
        <View style={styles.suggestionsCard}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {!isLoading && suggestions.length === 0 && (
            <Text style={styles.emptyText}>No se encontraron placas</Text>
          )}

          {!isLoading &&
            suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchText(item.placa);
                  onSelectPlaca(item.placa);
                  setIsFocused(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.suggestionText}>{item.placa}</Text>
              </TouchableOpacity>
            ))}

          {!isLoading && hasMore && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore} disabled={isLoadingMore} activeOpacity={0.85}>
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.loadMoreText}>Cargar más resultados</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {!disabled && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!disabled && !selectedPlaca && (
        <Text style={styles.helperText}>Ingresa una placa para habilitar el seguimiento</Text>
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
  suggestionsCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.input.border,
  },
  suggestionText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text.secondary,
    fontSize: 14,
  },
  loadMoreButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    color: colors.status.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
