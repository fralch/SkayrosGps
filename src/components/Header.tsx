import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, type ThemeColors } from '../theme/colors';

export const Header = () => {
  const { colors, mode, toggleMode } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="navigate" size={24} color={colors.primary} style={styles.logoIcon} />
        <Text style={styles.title}>Skayros<Text style={styles.titleHighlight}>GPS</Text></Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.settingsButton} onPress={toggleMode} activeOpacity={0.8}>
          <Ionicons
            name={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
            size={22}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 4,
  },
});
