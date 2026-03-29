import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type ThemeColors } from '../theme/colors';

interface LocationBannerProps {
  isLocationEnabled: boolean;
  justEnabled: boolean;
  isLoading: boolean;
}

export const LocationBanner = ({ isLocationEnabled, justEnabled, isLoading }: LocationBannerProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const shouldShow = !isLoading && (!isLocationEnabled || justEnabled);

  useEffect(() => {
    if (shouldShow) {
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

      if (!isLocationEnabled) {
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
  }, [shouldShow, isLocationEnabled, slideAnim, opacityAnim, pulseAnim]);

  if (!shouldShow) return null;

  const isDisabled = !isLocationEnabled;

  return (
    <Animated.View
      style={[
        styles.container,
        isDisabled ? styles.disabledBg : styles.enabledBg,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: isDisabled ? pulseAnim : 1 }] }}>
          <Ionicons
            name={isDisabled ? 'locate-outline' : 'checkmark-circle-outline'}
            size={20}
            color={isDisabled ? '#FEF3C7' : '#D1FAE5'}
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isDisabled ? styles.disabledText : styles.enabledText]}>
            {isDisabled ? 'Geolocalización desactivada' : 'Geolocalización activa'}
          </Text>
          <Text style={[styles.subtitle, isDisabled ? styles.disabledSubtext : styles.enabledSubtext]}>
            {isDisabled
              ? 'Activa el GPS del dispositivo para iniciar el seguimiento'
              : 'El GPS está listo para enviar coordenadas'}
          </Text>
        </View>

        <View style={[styles.statusDot, isDisabled ? styles.dotDisabled : styles.dotEnabled]} />
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
    disabledBg: {
      backgroundColor: '#78350F',
      borderWidth: 1,
      borderColor: '#92400E',
    },
    enabledBg: {
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
    disabledText: {
      color: '#FEF3C7',
    },
    disabledSubtext: {
      color: '#FCD34D',
      opacity: 0.8,
    },
    enabledText: {
      color: '#D1FAE5',
    },
    enabledSubtext: {
      color: '#6EE7B7',
      opacity: 0.8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotDisabled: {
      backgroundColor: '#F59E0B',
    },
    dotEnabled: {
      backgroundColor: '#10B981',
    },
  });
