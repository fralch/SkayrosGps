import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

const API_BASE_URL = 'https://api.skayros.com'; // TODO: Reemplazar con la URL real

export const useTracking = (selectedPlaca: string | null) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ distanceToday: 0, liveAssets: 0 }); // Mock stats for UI

  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };

  const startTracking = async () => {
    if (!selectedPlaca) {
      Alert.alert('Error', 'Debe seleccionar o ingresar una placa válida para iniciar.');
      return;
    }

    const hasInternet = await checkInternet();
    if (!hasInternet) {
      Alert.alert('Sin Conexión', 'Requiere conexión a internet para iniciar el tracking.');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Se requieren permisos de ubicación para esta función.');
      return;
    }

    setIsLoading(true);
    
    try {
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      setIsTracking(true);
      setStats({ ...stats, liveAssets: 1 }); // Mocking active asset
      
      trackingInterval.current = setInterval(async () => {
        sendCoordinates();
      }, 5000);

    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el servicio de ubicación.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCoordinates = async () => {
    try {
      const hasInternet = await checkInternet();
      if (!hasInternet) {
        console.warn('Sin internet. Saltando envío.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      const payload = {
        placa: selectedPlaca,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
        timestamp: new Date().toISOString()
      };

      console.log('Enviando coordenada:', payload);

      await fetch(`${API_BASE_URL}/api/gps/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Update mock distance for UI purposes
      setStats(prev => ({ ...prev, distanceToday: prev.distanceToday + 0.05 }));

    } catch (error) {
      console.error('Error enviando coordenada:', error);
    }
  };

  const confirmStopTracking = () => {
    Alert.alert(
      'Detener Tracking',
      '¿Está seguro que desea detener el envío de coordenadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Detener', 
          style: 'destructive',
          onPress: () => stopTracking() 
        }
      ]
    );
  };

  const stopTracking = () => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
    
    setIsTracking(false);
    setStats({ ...stats, liveAssets: 0 });
  };

  return {
    isTracking,
    isLoading,
    startTracking,
    stopTracking: confirmStopTracking,
    stats
  };
};
