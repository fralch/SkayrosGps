import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type ThemeColors } from '../theme/colors';

interface NetworkBannerProps {
  isConnected: boolean;
  justReconnected: boolean;
  isLoading: boolean;
}

/**
 * Animated banner that slides in/out to warn about lost internet connection.
 * Also shows a brief "back online" success message on reconnection.
 */
export const NetworkBanner = ({ isConnected, justReconnected, isLoading }: NetworkBannerProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const shouldShow = !isLoading && (!isConnected || justReconnected);

  useEffect(() => {
    if (shouldShow) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse the icon when offline
      if (!isConnected) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();
        return () => pulse.stop();
      }
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow, isConnected, slideAnim, opacityAnim, pulseAnim]);

  if (!shouldShow) return null;

  const isOffline = !isConnected;

  return (
    <Animated.View
      style={[
        styles.container,
        isOffline ? styles.offlineBg : styles.onlineBg,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: isOffline ? pulseAnim : 1 }] }}>
          <Ionicons
            name={isOffline ? 'cloud-offline-outline' : 'checkmark-circle-outline'}
            size={20}
            color={isOffline ? '#FEF3C7' : '#D1FAE5'}
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isOffline ? styles.offlineText : styles.onlineText]}>
            {isOffline ? 'Sin conexión a internet' : 'Conexión restablecida'}
          </Text>
          <Text style={[styles.subtitle, isOffline ? styles.offlineSubtext : styles.onlineSubtext]}>
            {isOffline
              ? 'Los datos se enviarán cuando se recupere la señal'
              : 'Los datos se están sincronizando'}
          </Text>
        </View>

        <View style={[styles.statusDot, isOffline ? styles.dotOffline : styles.dotOnline]} />
      </View>
    </Animated.View>
  );
};

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
    },
    offlineBg: {
      backgroundColor: '#78350F',
      borderWidth: 1,
      borderColor: '#92400E',
    },
    onlineBg: {
      backgroundColor: '#064E3B',
      borderWidth: 1,
      borderColor: '#065F46',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '500',
    },
    offlineText: {
      color: '#FEF3C7',
    },
    offlineSubtext: {
      color: '#FCD34D',
      opacity: 0.8,
    },
    onlineText: {
      color: '#D1FAE5',
    },
    onlineSubtext: {
      color: '#6EE7B7',
      opacity: 0.8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotOffline: {
      backgroundColor: '#F59E0B',
    },
    dotOnline: {
      backgroundColor: '#10B981',
    },
  });
