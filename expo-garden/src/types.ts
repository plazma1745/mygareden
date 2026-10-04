// Типы данных приложения (совместимы с Android-версией Sunflower)
export interface Plant {
  id: string; // локальный id или "trefle_<id>"
  name: string;
  description?: string;
  imageUrl?: string;
  family?: string;
  scientificName?: string;
}

export interface GardenPlant {
  plantId: string;
  addedAt: number; // timestamp
  lastWateredAt?: number; // timestamp
  wateringIntervalDays: number; // как часто поливать
}
