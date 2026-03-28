import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Hooks
import { useTracking } from './src/hooks/useTracking';
import { usePlacas } from './src/hooks/usePlacas';

// Components
import { Header } from './src/components/Header';
import { StatusHeader } from './src/components/StatusHeader';
import { PlateInput } from './src/components/PlateInput';
import { TrackingButton } from './src/components/TrackingButton';
import { StatsGrid } from './src/components/StatsGrid';

// Theme
import { colors } from './src/theme/colors';

export default function App() {
  const [selectedPlaca, setSelectedPlaca] = useState<string | null>(null);
  
  const { placas } = usePlacas();
  const { 
    isTracking, 
    isLoading, 
    startTracking, 
    stopTracking,
    stats 
  } = useTracking(selectedPlaca);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          
          <Header />
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

          <StatsGrid 
            liveAssets={stats.liveAssets}
            distanceToday={stats.distanceToday}
          />

        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  mainCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#253854',
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },
});
