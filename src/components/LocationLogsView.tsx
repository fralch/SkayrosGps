import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import type { TrackingLocationLog } from '../hooks/useTracking';
import { useTheme, type ThemeColors } from '../theme/colors';

interface LocationLogsViewProps {
  logs: TrackingLocationLog[];
  isTracking: boolean;
}

const formatTime = (isoString: string) =>
  new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(isoString));

export const LocationLogsView = ({ logs, isTracking }: LocationLogsViewProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs de ubicación (cada 5s)</Text>
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {isTracking ? 'Esperando la primera ubicación...' : 'Inicia el seguimiento para ver logs.'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} nestedScrollEnabled>
          {logs.map((log, index) => (
            <View key={log.id} style={[styles.logItem, index === 0 && styles.latestLogItem]}>
              <View style={styles.logRow}>
                <Text style={styles.logIndex}>#{logs.length - index}</Text>
                <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
              </View>
              <Text style={styles.logText}>Lat: {log.latitude.toFixed(6)}</Text>
              <Text style={styles.logText}>Lng: {log.longitude.toFixed(6)}</Text>
              <Text style={styles.logMeta}>
                Precisión: {log.accuracy !== null ? `${Math.round(log.accuracy)}m` : 'N/D'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    maxHeight: 220,
  },
  listContent: {
    gap: 10,
    paddingBottom: 4,
  },
  logItem: {
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: colors.input.background,
  },
  latestLogItem: {
    borderColor: colors.primary,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logIndex: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  logTime: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  logText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  logMeta: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 14,
    backgroundColor: colors.input.background,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
