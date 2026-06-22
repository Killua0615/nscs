import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../lib/theme';

const INFO_SECTIONS = [
  {
    title: 'NSCA-CPT 試験概要',
    items: [
      { label: '試験形式', value: '3択問題 155問（スコアード140問 + ノンスコアード15問）' },
      { label: '試験時間', value: '3時間' },
      { label: '合格基準', value: '得点率 約70%' },
      { label: '受験資格', value: '18歳以上、高卒以上、有効なCPR/AED認定' },
    ],
  },
  {
    title: '出題分野と配分',
    items: [
      { label: 'I. クライアントに対する面談と評価', value: '約25%（35問）' },
      { label: 'II. プログラムプランニング', value: '約31%（43問）' },
      { label: 'III. エクササイズテクニック', value: '約31%（43問）' },
      { label: 'IV. 安全性・緊急時の手順・法的諸問題', value: '約13%（19問）' },
    ],
  },
];

const LINKS = [
  { label: 'NSCA ジャパン 公式サイト', url: 'https://www.nsca-japan.or.jp/' },
  { label: 'NSCA-CPT 受験要項', url: 'https://www.nsca-japan.or.jp/exam/cpt/' },
];

export function InfoScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>関連情報</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {INFO_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>外部リンク</Text>
          {LINKS.map((link) => (
            <TouchableOpacity
              key={link.url}
              style={styles.linkRow}
              onPress={() => Linking.openURL(link.url)}
            >
              <Text style={styles.linkText}>{link.label}</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            本アプリは非公式であり、NSCA（National Strength and Conditioning Association）とは関係ありません。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  content: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  linkArrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  disclaimer: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
