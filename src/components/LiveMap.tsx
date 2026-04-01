import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { LocationObjectCoords } from 'expo-location';
import { useTheme, type ThemeColors } from '../theme/colors';

interface LiveMapProps {
  currentLocation: LocationObjectCoords | null;
  isTracking: boolean;
}

const DEFAULT_REGION = {
  latitude: 4.711,
  longitude: -74.0721,
};

export const LiveMap = ({ currentLocation, isTracking }: LiveMapProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const mapRef = useRef<WebView | null>(null);
  const [mapError, setMapError] = useState(false);

  const markerCoords = useMemo(() => {
    if (!currentLocation) return null;
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    };
  }, [currentLocation]);

  const mapHtml = useMemo(() => {
    const latitude = markerCoords?.latitude ?? DEFAULT_REGION.latitude;
    const longitude = markerCoords?.longitude ?? DEFAULT_REGION.longitude;
    const zoom = markerCoords ? 17 : 14;
    const markerColor = colors.primary;
    const hasLocation = Boolean(markerCoords);
    const popupText = hasLocation ? 'Ubicación actual' : 'Ubicación por defecto';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
          <style>
            html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
            body { background: #0b1220; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            window.onerror = function(message) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('error:' + message);
              }
            };
            const map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], ${zoom});
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const vehicleIcon = L.divIcon({
              html: '<div style="width:16px;height:16px;border-radius:50%;background:${markerColor};border:2px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,0.18);"></div>',
              className: '',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            let marker = L.marker([${latitude}, ${longitude}], { icon: vehicleIcon }).addTo(map);
            marker.bindPopup('${popupText}');

            window.updatePosition = (lat, lng, animate) => {
              if (!marker) {
                marker = L.marker([lat, lng], { icon: vehicleIcon }).addTo(map);
              } else {
                marker.setLatLng([lat, lng]);
              }

              if (animate) {
                map.flyTo([lat, lng], 17, { duration: 0.8 });
              } else {
                map.setView([lat, lng], 17);
              }
            };
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('ready');
            }
          </script>
        </body>
      </html>
    `;
  }, [markerCoords, colors.primary]);

  useEffect(() => {
    if (!markerCoords || !mapRef.current) return;
    mapRef.current.injectJavaScript(`window.updatePosition(${markerCoords.latitude}, ${markerCoords.longitude}, true); true;`);
  }, [markerCoords]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Mapa en vivo (Leaflet)</Text>
      <View style={styles.mapContainer}>
        <WebView
          ref={mapRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onError={() => setMapError(true)}
          onHttpError={() => setMapError(true)}
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            if (message.startsWith('error:')) {
              setMapError(true);
              return;
            }
            if (message === 'ready') {
              setMapError(false);
            }
          }}
        />
      </View>
      {mapError && <Text style={styles.errorText}>No se pudo cargar el mapa. Verifica conexión a internet.</Text>}
      <Text style={styles.subtitle}>
        {currentLocation
          ? `Lat: ${currentLocation.latitude.toFixed(6)} | Lng: ${currentLocation.longitude.toFixed(6)}`
          : isTracking
            ? 'Buscando ubicación...'
            : 'Inicia el seguimiento para ver tu ubicación en el mapa'}
      </Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.input.border,
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: '#F87171',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
});
