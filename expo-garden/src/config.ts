// Конфигурация: API-токен Trefle.
// Вариант 1 (рекомендуется): expo secret + app.json -> extra.trefleToken
//   npx eas secrets:set TREFLE_TOKEN
// Вариант 2: вставьте токен прямо сюда (не коммитьте в публичный репозиторий!)
import Constants from 'expo-constants';

export const TREFLE_TOKEN: string =
  (Constants.expoConfig?.extra?.trefleToken as string) ?? process.env.EXPO_PUBLIC_TREFLE_TOKEN ?? '';
