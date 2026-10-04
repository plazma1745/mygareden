// Экран поиска растений через Trefle (аналог TrefleSearchScreen из Android-версии)
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { searchPlants } from '../trefleApi';
import { upsertPlant } from '../storage';
import { Plant } from '../types';

interface Props {
  onAdded: () => void; // перейти в "Мой сад"
}

export default function SearchScreen({ onAdded }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Plant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  async function onSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchPlants(q));
    } catch (e) {
      setResults(null);
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  async function onAdd(plant: Plant) {
    try {
      await upsertPlant(plant);
      setAddedIds((prev) => new Set(prev).add(plant.id));
      Alert.alert('Добавлено', `«${plant.name}» сохранён в каталог. Добавьте его в сад.`);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить растение');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Название растения (латиницей, напр. tomato)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={onSearch}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 24 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {results && results.length === 0 && !loading && (
        <Text style={styles.empty}>Ничего не найдено. Попробуйте другой запрос.</Text>
      )}

      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          results && results.length > 0 ? <Text style={styles.count}>Найдено: {results.length}</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Text style={{ fontSize: 32 }}>🌱</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
              <Pressable
                style={[styles.addBtn, addedIds.has(item.id) && styles.addedBtn]}
                onPress={() => onAdd(item)}
                disabled={addedIds.has(item.id)}
              >
                <Text style={styles.addBtnText}>
                  {addedIds.has(item.id) ? '✓ В каталоге' : '+ Добавить'}
                </Text>
              </Pressable>
              {addedIds.has(item.id) && (
                <Pressable style={styles.gardenBtn} onPress={onAdded}>
                  <Text style={styles.gardenBtnText}>Перейти в «Мой сад» →</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#fff',
  },
  searchBtn: { backgroundColor: '#2e7d32', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  error: { color: '#c62828', marginVertical: 12, fontSize: 15 },
  empty: { color: '#666', marginTop: 24, textAlign: 'center' },
  count: { color: '#666', marginBottom: 8 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12,
    marginBottom: 12, gap: 12, shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  image: { width: 90, height: 90, borderRadius: 10 },
  noImage: { backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#1b5e20' },
  desc: { fontSize: 13, color: '#555', marginTop: 4 },
  addBtn: { backgroundColor: '#2e7d32', borderRadius: 8, padding: 10, marginTop: 8, alignSelf: 'flex-start' },
  addedBtn: { backgroundColor: '#a5d6a7' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  gardenBtn: { marginTop: 6, alignSelf: 'flex-start' },
  gardenBtnText: { color: '#2e7d32', fontWeight: '600' },
});
