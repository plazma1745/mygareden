# История чата — приложение «Мой сад»

**Дата:** 4 октября 2026 г.
**Рабочая директория:** `/workspace` (git-репозиторий)

---

## Хронология запросов и решений

### 1. Идея: приложение для управления садом
- **Запрос:** «хочу создать приложение для управления своим садом».
- **Решение:** в `/workspace` уже находился готовый Android-проект **Sunflower** (Kotlin + Jetpack Compose + Room + Hilt/Retrofit): каталог растений, грядки/сад, учёт полива, локальная БД Room. Обсуждались направления развития: расписание подкормок, погода, русификация, уведомления, веб-версия.

### 2. Интеграция FloraCodex API (floracodex.com)
- **Запрос:** подключить API FloraCodex для добавления растений.
- **Реализовано:** Retrofit-сервис `FloraCodexService.kt`, модели ответа, репозиторий с маппингом в сущность `Plant` (id вида `floracodex_<id>`), `FloraCodexSearchViewModel`, экран `FloraCodexSearchScreen.kt`, маршрут навигации, DI-провайдер, строки.
- **Обнаруженное ограничение:** публичный эндпоинт `https://api.floracodex.com/v1/plants/search` возвращает `401 auth/missingToken` (Firebase App Check). Без токена поиск не работает.
- **Предложенные альтернативы:** Perenual API, Trefle API, поле ввода пользовательского токена.

### 3. Выбор Trefle API
- **Запрос:** «Trefle API — тот же UI, рабочий поиск сразу. объясни».
- **Пояснение:** Trefle (trefle.io) — открытая REST-база растений; бесплатный токен выдаётся за пару минут после регистрации; лимит ~30 000 запросов/мес; качественные садоводческие данные (семейства, условия выращивания).

### 4. Замена FloraCodex на Trefle
- **Запрос:** «используй».
- **Реализовано:** `TrefleService.kt` (эндпоинт `https://trefle.io/api/v1/species/search`, токен через query-параметр), `TrefleModels.kt`, `TrefleRepository`, `TrefleSearchViewModel`, экран `compose/trefle/TrefleSearchScreen.kt`, маршрут `Screen.TrefleSearch`. Токен задаётся в `gradle.properties` (`trefle_token=`) и передаётся в BuildConfig.

### 5. Как протестировать
- Получение токена: регистрация на https://trefle.io/users/sign_up → копировать токен со страницы профиля → вписать в `gradle.properties`.
- Быстрая проверка API без сборки:
  ```bash
  curl "https://trefle.io/api/v1/species/search?q=tomato&token=ВАШ_ТОКЕН"
  ```
- Сборка в Android Studio (`./gradlew installDebug` или Run ▶), проверка UI-сценариев: вкладка «Plant list» → иконка 🔍 → поиск → Add → растение появляется в Room и его можно добавить в сад.
- Дополнительно: unit-тесты `TrefleRepository`, MockWebServer, отладка 401/429 через OkHttp-логи.

### 6. Загрузка проекта в Kodular
- **Вывод:** невозможно напрямую — Kodular (App Inventor-подобный конструктор блоков) не импортирует Kotlin/Gradle-проекты.
- **Варианты:** пересборка в Kodular блоками (компонент `Web` + JSON Parser + TinyDB), продолжение работы в Android Studio, либо подготовка документации по миграции.

### 7. Обсуждение PWA
- PWA как альтернатива: React + Vite, IndexedDB вместо Room, Web Push для уведомлений о поливе, установка на домашний экран, хостинг бесплатно. Вопрос защиты токена Trefle (лучше прокси). Не реализовывалось — выбран Expo.

### 8. Миграция на Expo
- **Запрос:** «я подключил проект к expo, соберу его там».
- **Важно:** Kotlin/Compose-код нельзя импортировать в Expo (React Native = JS/TS). Поэтому создан параллельный проект **`/workspace/expo-garden`**:
  - Expo SDK 53, React Native 0.79, TypeScript;
  - `App.tsx` — нижняя навигация: 🪴 Мой сад / 🌿 Каталог / 🔍 Поиск;
  - `src/trefleApi.ts` — поиск Trefle + маппинг в модель Plant (`trefle_<id>`), обработка 401/429;
  - `src/storage.ts` — AsyncStorage (замена Room): upsert без дублей, добавление в сад, отметка полива, «нужен полив»;
  - `src/screens/SearchScreen.tsx`, `CatalogScreen.tsx`, `GardenScreen.tsx`;
  - `app.json` — токен в `expo.extra.trefleToken` или env `EXPO_PUBLIC_TREFLE_TOKEN`;
  - `README.md` — инструкция запуска/сборки.
- **Проверено сборкой:** `npm install`, `npx expo install --fix`, `npx tsc --noEmit` (без ошибок), `expo-doctor` (18/18), Metro-бандл собирается (HTTP 200).
- **Сборка APK:** `npx expo start` (Expo Go, QR-код) → `eas build -p android --profile preview` (облачная сборка, без локального Android SDK).

### 9. Сохранение чата
- **Запрос:** «как сохранить этот чат в .md» → затем «где этот workspace».
- Настоящий файл — сохранённая история чата.

---

## Текущее состояние `/workspace`

| Путь | Описание |
|---|---|
| `app/`, `build.gradle.kts`, `gradle.properties` | Android-проект Sunflower (Kotlin + Compose) с интеграцией Trefle |
| `expo-garden/` | Expo-версия приложения (React Native + TypeScript) с тем же функционалом |
| `chat-history.md` | Этот файл |

## Ключевые ссылки
- Trefle API: https://trefle.io/api/v1/species/search?q=<запрос>&token=<токен>
- Регистрация токена: https://trefle.io/users/sign_up (токен — на странице профиля)
- Expo: https://docs.expo.dev / EAS Build: https://docs.expo.dev/build/introduction/

## Следующие шаги (по желанию)
- Вписать реальный токен Trefle в `gradle.properties` и `app.json`.
- Тест на устройстве через Expo Go; сборка APK через `eas build`.
- Опционально: push-уведомления о поливе (expo-notifications), экспорт/импорт данных сада, unit-тесты репозитория.
