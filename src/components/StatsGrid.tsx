import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface StatsGridProps {
  liveAssets: number;
  distanceToday: number;
}

export const StatsGrid = ({ liveAssets, distanceToday }: StatsGridProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dot} />
          <Text style={styles.cardLabel}>LIVE ASSETS</Text>
        </View>
        <Text style={styles.cardValue}>{liveAssets}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics" size={16} color={colors.text.secondary} />
          <Text style={[styles.cardLabel, { marginLeft: 6 }]}>DIST. TODAY</Text>
        </View>
        <Text style={styles.cardValue}>
          {distanceToday.toFixed(0)} <Text style={styles.unit}>km</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  cardLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardValue: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: 'normal',
  },
});
