# Expo Garden — управление садом (React Native / Expo)

Мобильная версия приложения «Мой сад» на **Expo** с поиском растений через **Trefle API**.
Переносит функциональность Android-версии (Sunflower): поиск и добавление растений, каталог, учёт полива.

## Структура
```
expo-garden/
├── App.tsx                    # нижняя навигация: Мой сад / Каталог / Поиск
├── index.ts                   # точка входа
├── app.json                   # конфигурация Expo (+ extra.trefleToken)
├── package.json
└── src/
    ├── config.ts              # чтение токена Trefle
    ├── types.ts               # Plant, GardenPlant
    ├── trefleApi.ts           # https://trefle.io/api/v1/species/search
    ├── storage.ts             # AsyncStorage (аналог Room): upsert без дублей, полив
    └── screens/
        ├── SearchScreen.tsx   # поиск Trefle + «Добавить»
        ├── CatalogScreen.tsx  # сохранённые растения, «В мой сад»
        └── GardenScreen.tsx   # сад, статус полива, кнопки «Полить»/«Удалить»
```

## Запуск
1. Установите зависимости: `npm install`
2. Получите токен Trefle: регистрация на https://trefle.io → страница профиля → скопируйте API token.
3. Впишите токен в `app.json`: `"extra": { "trefleToken": "ВАШ_ТОКЕН" }`
   (или используйте переменную окружения `EXPO_PUBLIC_TREFLE_TOKEN` в файле `.env` — не коммитьте её).
4. Запустите: `npx expo start`
   - Отсканируйте QR-код приложением **Expo Go** (Android/iOS) — быстрый тест на телефоне;
   - Или `npx expo start --web` для браузера.

## Сборка APK/AAB
- **EAS Build (облако, без локального Android SDK):**
  `npm i -g eas-cli && eas login`, затем `eas build -p android --profile preview`.
  Для секрета вместо app.json можно использовать: `eas secret create TREFLE_TOKEN <токен>`
  и прочитать его в Expo через `extra` (EAS подставляет значения при сборке).
- **Локально:** `eas build -p android --profile preview --local` (нужны Android SDK + JDK 17).

## Замечания
- Токен в клиентском приложении видим тем, у кого есть доступ к бандлу; для личного использования это приемлемо.
- Лимит Trefle: 30 000 запросов/мес на бесплатном аккаунте. Ошибки 401/429 показываются в UI поиска.
- Данные хранятся локально (AsyncStorage), офлайн-режим работает: каталог и сад доступны без сети, поиск — только онлайн.
