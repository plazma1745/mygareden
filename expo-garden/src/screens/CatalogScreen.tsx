// Каталог сохранённых растений: добавление в сад / удаление из сада
import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { addToGarden, getGarden, getPlants, removeFromGarden } from '../storage';
import { GardenPlant, Plant } from '../types';

export default function CatalogScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [garden, setGarden] = useState<Map<string, GardenPlant>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [p, g] = await Promise.all([getPlants(), getGarden()]);
    setPlants(p);
    setGarden(new Map(g.map((e) => [e.plantId, e])));
    setRefreshing(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function onToggleInGarden(plant: Plant) {
    if (garden.has(plant.id)) await removeFromGarden(plant.id);
    else await addToGarden(plant.id);
    await load();
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={plants}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      ListEmptyComponent={
        <Text style={styles.empty}>Каталог пуст. Воспользуйтесь поиском 🔍, чтобы добавить растения через Trefle.</Text>
      }
      renderItem={({ item }) => {
        const inGarden = garden.has(item.id);
        return (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.noImage]}><Text style={{ fontSize: 32 }}>🌿</Text></View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              {!!item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
              <Pressable
                style={[styles.btn, inGarden && styles.btnOut]}
                onPress={() => onToggleInGarden(item)}
              >
                <Text style={[styles.btnText, inGarden && styles.btnTextOut]}>
                  {inGarden ? '− Убрать из сада' : '+ В мой сад'}
                </Text>
              </Pressable>
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
  desc: { fontSize: 13, color: '#555', marginTop: 4 },
  btn: { backgroundColor: '#2e7d32', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginTop: 8, alignSelf: 'flex-start' },
  btnOut: { backgroundColor: '#ffcdd2' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextOut: { color: '#b71c1c' },
});
