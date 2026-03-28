import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

export const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="navigate" size={24} color={colors.primary} style={styles.logoIcon} />
        <Text style={styles.title}>Skayros<Text style={styles.titleHighlight}>GPS</Text></Text>
      </View>
      <Ionicons name="location-outline" size={24} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    transform: [{ rotate: '45deg' }],
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  titleHighlight: {
    fontWeight: '500',
  },
});
