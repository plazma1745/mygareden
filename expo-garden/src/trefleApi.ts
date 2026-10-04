// API-клиент Trefle (https://trefle.io/api/v1) — тот же источник, что в Android-версии
import { TREFLE_TOKEN } from './config';
import { Plant } from './types';

const BASE_URL = 'https://trefle.io/api/v1/species/search';

interface TrefleSpecies {
  id: number;
  common_name?: string | null;
  scientific_name?: string | null;
  family_common_name?: string | null;
  image_url?: string | null;
  year? : number | null;
}

interface TrefleSearchResponse {
  data?: TrefleSpecies[];
  errors?: { code: string; title: string }[];
  links?: Record<string, string>;
}

function toPlant(s: TrefleSpecies): Plant {
  const descriptionParts: string[] = [];
  if (s.scientific_name) descriptionParts.push(`Латинское название: ${s.scientific_name}`);
  if (s.family_common_name) descriptionParts.push(`Семейство: ${s.family_common_name}`);
  return {
    id: `trefle_${s.id}`,
    name: s.common_name || s.scientific_name || 'Без названия',
    scientificName: s.scientific_name ?? undefined,
    family: s.family_common_name ?? undefined,
    imageUrl: s.image_url ? `https://trefle.io${s.image_url}` : undefined,
    description: descriptionParts.join('\n'),
  };
}

export async function searchPlants(query: string): Promise<Plant[]> {
  if (!TREFLE_TOKEN) {
    throw new Error('Не задан токен Trefle. Укажите его в app.json -> expo.extra.trefleToken или EXPO_PUBLIC_TREFLE_TOKEN');
  }
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&token=${encodeURIComponent(TREFLE_TOKEN)}`;
  const res = await fetch(url);
  if (res.status === 401) throw new Error('Ошибка авторизации Trefle (401): проверьте токен');
  if (res.status === 429) throw new Error('Превышен лимит запросов Trefle (429). Повторите позже');
  if (!res.ok) throw new Error(`Ошибка сети: HTTP ${res.status}`);
  const json = (await res.json()) as TrefleSearchResponse;
  if (json.errors?.length) throw new Error(json.errors[0].title);
  return (json.data ?? []).map(toPlant);
}
