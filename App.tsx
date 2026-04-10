import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

// Hooks
import { useTracking } from './src/hooks/useTracking';
import { usePlacas } from './src/hooks/usePlacas';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useLocationServiceStatus } from './src/hooks/useLocationServiceStatus';

// Components
import { Header } from './src/components/Header';
import { StatusHeader } from './src/components/StatusHeader';
import { PlateInput } from './src/components/PlateInput';
import { TrackingButton } from './src/components/TrackingButton';
import { LiveMap } from './src/components/LiveMap';
import { NetworkBanner } from './src/components/NetworkBanner';
import { LocationBanner } from './src/components/LocationBanner';

// Theme
import { ThemeProvider, useTheme, type ThemeColors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const AppContent = () => {
  const { colors, mode } = useTheme();
  const styles = createStyles(colors);
  const [selectedPlaca, setSelectedPlaca] = useState<string | null>(null);

  const {
    suggestions,
    isLoadingPlacas,
    isLoadingMore,
    hasMore,
    errorMessage,
    searchPlacas,
    loadMore
  } = usePlacas();
  const { isConnected, justReconnected, isLoading: isNetworkLoading } = useNetworkStatus();
  const {
    isLocationEnabled,
    justEnabled: justLocationEnabled,
    isLoading: isLocationLoading
  } = useLocationServiceStatus();
  const { 
    isTracking, 
    isLoading, 
    isStopModalVisible,
    currentLocation,
    startTracking, 
    stopTracking,
    cancelStopTracking,
    confirmStopTracking
  } = useTracking(selectedPlaca, setSelectedPlaca);

  const btnDisabled = !selectedPlaca || !isLocationEnabled || isLocationLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          
        <Header />

        <NetworkBanner
          isConnected={isConnected}
          justReconnected={justReconnected}
          isLoading={isNetworkLoading}
        />
        <LocationBanner
          isLocationEnabled={isLocationEnabled}
          justEnabled={justLocationEnabled}
          isLoading={isLocationLoading}
        />

        <StatusHeader isTracking={isTracking} isConnected={isConnected} />

        <View style={styles.mainCard}>
          <PlateInput 
            selectedPlaca={selectedPlaca}
            onSelectPlaca={setSelectedPlaca}
            suggestions={suggestions}
            isLoading={isLoadingPlacas}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            errorMessage={errorMessage}
            onSearch={searchPlacas}
            onLoadMore={loadMore}
            disabled={isTracking}
          />

          <TrackingButton 
            isTracking={isTracking}
            isLoading={isLoading}
            disabled={btnDisabled}
            onStart={startTracking}
            onStop={stopTracking}
          />
        </View>

        {isTracking && <LiveMap currentLocation={currentLocation} isTracking={isTracking} />}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Copyright © {new Date().getFullYear()} Innovaiagroup</Text>
        </View>

        <Modal
          visible={isStopModalVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelStopTracking}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="stop-circle-outline" size={28} color={colors.status.danger} />
              </View>
              <Text style={styles.modalTitle}>Detener seguimiento</Text>
              <Text style={styles.modalDescription}>¿Está seguro que desea detener el envío de coordenadas?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalSecondaryButton} onPress={cancelStopTracking} activeOpacity={0.85}>
                  <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDangerButton} onPress={confirmStopTracking} activeOpacity={0.85}>
                  <Text style={styles.modalDangerButtonText}>Sí, Detener</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 8, 20, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 24,
    padding: 22,
  },
  modalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.input.background,
    marginBottom: 14,
  },
  modalTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDescription: {
    color: colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  modalActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDangerButton: {
    flex: 1,
    backgroundColor: colors.status.danger,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDangerButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
