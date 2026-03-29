import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Hooks
import { useTracking } from './src/hooks/useTracking';
import { usePlacas } from './src/hooks/usePlacas';

// Components
import { Header } from './src/components/Header';
import { StatusHeader } from './src/components/StatusHeader';
import { PlateInput } from './src/components/PlateInput';
import { TrackingButton } from './src/components/TrackingButton';
import { LiveMap } from './src/components/LiveMap';

// Theme
import { ThemeProvider, useTheme, accentOptions, type ThemeColors } from './src/theme/colors';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const AppContent = () => {
  const { colors, mode, accent, setAccent } = useTheme();
  const styles = createStyles(colors);
  const [selectedPlaca, setSelectedPlaca] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const { placas } = usePlacas();
  const { 
    isTracking, 
    isLoading, 
    currentLocation,
    startTracking, 
    stopTracking
  } = useTracking(selectedPlaca);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.container}>
          
        <Header
          isColorPickerOpen={showPreferences}
          onToggleColorPicker={() => setShowPreferences((prev) => !prev)}
        />

        {showPreferences && (
          <View style={styles.preferencesCard}>
            <Text style={styles.preferencesLabel}>Color principal</Text>
            <View style={styles.accentList}>
              {accentOptions.map((option) => {
                const selected = accent === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.accentItem,
                      { borderColor: selected ? option.value : colors.input.border }
                    ]}
                    onPress={() => {
                      setAccent(option.value);
                      setShowPreferences(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.accentDot, { backgroundColor: option.value }]} />
                    <Text style={[styles.accentLabel, selected && { color: colors.text.primary }]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <StatusHeader isTracking={isTracking} />

        <View style={styles.mainCard}>
          <PlateInput 
            placas={placas}
            selectedPlaca={selectedPlaca}
            onSelectPlaca={setSelectedPlaca}
            disabled={isTracking}
          />

          <TrackingButton 
            isTracking={isTracking}
            isLoading={isLoading}
            disabled={!selectedPlaca}
            onStart={startTracking}
            onStop={stopTracking}
          />
        </View>

        {isTracking && <LiveMap currentLocation={currentLocation} isTracking={isTracking} />}

      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  preferencesCard: {
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.input.border,
    padding: 14,
  },
  preferencesLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  accentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.input.background,
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 7,
  },
  accentLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    marginBottom: 24,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
});
