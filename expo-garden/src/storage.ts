// Хранилище на AsyncStorage (аналог Room из Android-версии)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GardenPlant, Plant } from './types';

const PLANTS_KEY = 'garden_plants';
const GARDEN_KEY = 'garden_entries';

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function getPlants(): Promise<Plant[]> {
  return readJSON<Plant[]>(PLANTS_KEY, []);
}

// upsert по id — без дубликатов (как upsertPlant в Android-версии)
export async function upsertPlant(plant: Plant): Promise<void> {
  const plants = await getPlants();
  const idx = plants.findIndex((p) => p.id === plant.id);
  if (idx >= 0) plants[idx] = plant;
  else plants.unshift(plant);
  await AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
}

export async function getGarden(): Promise<GardenPlant[]> {
  return readJSON<GardenPlant[]>(GARDEN_KEY, []);
}

export async function addToGarden(plantId: string, wateringIntervalDays = 3): Promise<void> {
  const garden = await getGarden();
  if (garden.some((g) => g.plantId === plantId)) return;
  garden.push({ plantId, addedAt: Date.now(), wateringIntervalDays });
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
}

export async function removeFromGarden(plantId: string): Promise<void> {
  const garden = await getGarden();
  await AsyncStorage.setItem(
    GARDEN_KEY,
    JSON.stringify(garden.filter((g) => g.plantId !== plantId)),
  );
}

export async function waterPlant(plantId: string): Promise<void> {
  const garden = await getGarden();
  const entry = garden.find((g) => g.plantId === plantId);
  if (!entry) return;
  entry.lastWateredAt = Date.now();
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(garden));
}

export function needsWatering(entry: GardenPlant): boolean {
  if (!entry.lastWateredAt) return true;
  const daysSince = (Date.now() - entry.lastWateredAt) / 86_400_000;
  return daysSince >= entry.wateringIntervalDays;
}
