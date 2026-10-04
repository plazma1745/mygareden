// Экран «Мой сад»: растения с учётом полива (аналог My Garden из Android-версии)
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getGarden, getPlants, needsWatering, removeFromGarden, waterPlant } from '../storage';
import { GardenPlant, Plant } from '../types';

export default function GardenScreen() {
  const [entries, setEntries] = useState<(GardenPlant & { plant: Plant })[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [garden, plants] = await Promise.all([getGarden(), getPlants()]);
    const byId = new Map(plants.map((p) => [p.id, p]));
    setEntries(
      garden
        .filter((g) => byId.has(g.plantId))
        .map((g) => ({ ...g, plant: byId.get(g.plantId)! })),
    );
    setRefreshing(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function onWater(plantId: string) {
    await waterPlant(plantId);
    await load();
  }

  async function onRemove(plantId: string) {
    await removeFromGarden(plantId);
    await load();
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={entries}
      keyExtractor={(item) => item.plantId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      ListEmptyComponent={
        <Text style={styles.empty}>Сад пуст. Найдите растение через поиск 🔍 и добавьте его сюда.</Text>
      }
      renderItem={({ item }) => {
        const due = needsWatering(item);
        return (
          <View style={styles.card}>
            {item.plant.imageUrl ? (
              <Image source={{ uri: item.plant.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.noImage]}><Text style={{ fontSize: 32 }}>🪴</Text></View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.plant.name}</Text>
              <Text style={due ? styles.due : styles.ok}>
                {due ? '💧 Нужен полив' : `✅ Полит ${item.lastWateredAt ? new Date(item.lastWateredAt).toLocaleDateString('ru-RU') : ''}`}
              </Text>
              <View style={styles.actions}>
                <Pressable style={styles.waterBtn} onPress={() => onWater(item.plantId)}>
                  <Text style={styles.waterBtnText}>Полить</Text>
                </Pressable>
                <Pressable style={styles.removeBtn} onPress={() => onRemove(item.plantId)}>
                  <Text style={styles.removeBtnText}>Удалить</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { color: '#666', textAlign: 'center', marginTop: 48, fontSize: 15, lineHeight: 22 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 10 },
  noImage: { backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', color: '#1b5e20' },
  due: { color: '#e65100', marginTop: 4, fontWeight: '600' },
  ok: { color: '#2e7d32', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  waterBtn: { backgroundColor: '#1565c0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  waterBtnText: { color: '#fff', fontWeight: '700' },
  removeBtn: { backgroundColor: '#ffcdd2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  removeBtnText: { color: '#b71c1c', fontWeight: '700' },
});
