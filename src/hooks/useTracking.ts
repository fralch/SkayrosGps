import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

export const useTracking = (selectedPlaca: string | null) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async () => {
    if (!selectedPlaca) {
      Alert.alert('Error', 'Debe seleccionar o ingresar una placa válida para iniciar.');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Se requieren permisos de ubicación para esta función.');
      return;
    }

    setIsLoading(true);
    
    try {
      await logCurrentLocation();
      setIsTracking(true);
      
      trackingInterval.current = setInterval(async () => {
        await logCurrentLocation();
      }, 5000);

    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el servicio de ubicación.');
    } finally {
      setIsLoading(false);
    }
  };

  const logCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      const payload = {
        placa: selectedPlaca,
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
        timestamp: new Date().toISOString()
      };

      console.log('Ubicación actual (modo prueba):', payload);

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const confirmStopTracking = () => {
    Alert.alert(
      'Detener seguimiento',
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
  };

  return {
    isTracking,
    isLoading,
    startTracking,
    stopTracking: confirmStopTracking
  };
};
