import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

const API_BASE_URL = 'https://api.skayros.com'; // TODO: Reemplazar con la URL real de la API

export default function App() {
  const [placas, setPlacas] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPlaca, setSelectedPlaca] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPlacas();
    return () => {
      stopTracking();
    };
  }, []);

  const fetchPlacas = async () => {
    try {
      // Intento de conexión con la API
      const response = await fetch(`${API_BASE_URL}/api/gps/track`);
      if (response.ok) {
        const data = await response.json();
        setPlacas(data);
      } else {
        throw new Error('Error al obtener placas');
      }
    } catch (error) {
      console.warn('Usando datos de prueba porque falló la API:', error);
      // Mock data in case API is not available
      setPlacas(['ABC-123', 'DEF-456', 'GHI-789', 'XYZ-999']);
    }
  };

  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };

  const handleStartTracking = async () => {
    if (!selectedPlaca) {
      Alert.alert('Error', 'Debe seleccionar una placa válida para iniciar.');
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
      // Verificar que podemos obtener la ubicación inicial
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      setIsTracking(true);
      
      // Enviar coordenadas cada 5 segundos
      trackingInterval.current = setInterval(async () => {
        sendCoordinates();
      }, 5000);

      // Opcional: También podemos suscribirnos a cambios de ubicación si se desea mayor precisión
      // locationSubscription.current = await Location.watchPositionAsync(
      //   { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      //   (location) => { ... }
      // );
      
      Alert.alert('Tracking Iniciado', `Enviando ubicación para la placa ${selectedPlaca}`);
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
    } catch (error) {
      console.error('Error enviando coordenada:', error);
    }
  };

  const handleStopTracking = () => {
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
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    setIsTracking(false);
    setSelectedPlaca(null);
    setSearchText('');
  };

  const filteredPlacas = placas.filter(p => 
    p.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Tracking GPS</Text>
        <Text style={styles.subtitle}>Skayros</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Número de Placa:</Text>
        
        <View style={styles.autocompleteContainer}>
          <TextInput
            style={[
              styles.input, 
              isTracking && styles.inputDisabled
            ]}
            placeholder="Ingrese o seleccione placa..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setSelectedPlaca(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            editable={!isTracking}
          />

          {showSuggestions && !isTracking && searchText.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={filteredPlacas}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSearchText(item);
                      setSelectedPlaca(item);
                      setShowSuggestions(false);
                      Keyboard.dismiss();
                    }}
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

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.startButton,
              (!selectedPlaca || isTracking) && styles.buttonDisabled
            ]}
            onPress={handleStartTracking}
            disabled={!selectedPlaca || isTracking || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>INICIAR</Text>
            )}
          </TouchableOpacity>

          {isTracking && (
            <TouchableOpacity 
              style={[styles.button, styles.stopButton]}
              onPress={handleStopTracking}
            >
              <Text style={styles.buttonText}>DETENER</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#93C5FD',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  suggestionList: {
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 16,
    color: '#374151',
  },
  emptyText: {
    padding: 15,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 15,
  },
  button: {
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
