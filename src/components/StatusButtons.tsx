import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { StatusType } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';
import { STATUS_LABELS, STATUS_COLORS } from '../lib/statusCalculator';

interface Props {
  currentStatus?: StatusType;
  onSelect: (status: StatusType) => void;
  includeUnlearned?: boolean;
}

export function StatusButtons({ currentStatus, onSelect, includeUnlearned }: Props) {
  const options: StatusType[] = includeUnlearned
    ? ['perfect', 'almost', 'weak', 'unlearned']
    : ['perfect', 'almost', 'weak'];

  return (
    <View style={styles.container}>
      {options.map((status) => {
        const isActive = currentStatus === status;
        const color = STATUS_COLORS[status];
        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.button,
              { borderColor: color },
              isActive && { backgroundColor: color },
            ]}
            onPress={() => onSelect(status)}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeText: {
    color: COLORS.textLight,
  },
});
