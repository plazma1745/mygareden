// Точка входа: простая нижняя навигация без сторонних навигаторов
import React, { useState } from 'react';
import { SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GardenScreen from './src/screens/GardenScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import SearchScreen from './src/screens/SearchScreen';

type Tab = 'garden' | 'catalog' | 'search';

const TABS: { id: Tab; label: string }[] = [
  { id: 'garden', label: '🪴 Мой сад' },
  { id: 'catalog', label: '🌿 Каталог' },
  { id: 'search', label: '🔍 Поиск' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('garden');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Мой сад</Text>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'garden' && <GardenScreen />}
        {tab === 'catalog' && <CatalogScreen />}
        {tab === 'search' && <SearchScreen onAdded={() => setTab('catalog')} />}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Text
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            {t.label}
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f4f7f2', paddingTop: RNStatusBar.currentHeight ?? 0 },
  header: { backgroundColor: '#2e7d32', paddingVertical: 14, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd',
    paddingVertical: 10, paddingHorizontal: 8,
  },
  tab: { flex: 1, textAlign: 'center', color: '#666', fontWeight: '600', fontSize: 14 },
  tabActive: { color: '#2e7d32' },
});
