# Cvety.kz Admin Panel & AI Chat (React + shadcn/ui)

Современная админ-панель и AI чат для управления цветочным магазином, построенная на React с компонентами shadcn/ui.

## 🚀 Функции

### AI Чат
- Интеграция с GPT-4.1 mini через Function Calling
- Точный поиск товаров по цене и событию
- История диалога в рамках сессии
- Красивый интерфейс чата

### Админ панель
- Управление товарами (добавление, редактирование)
- Просмотр и управление заказами
- Статистика и аналитика
- Поиск по товарам и заказам

## 🛠️ Технологии

- **React 18** + **TypeScript**
- **Vite** - быстрая сборка
- **Tailwind CSS** - стилизация
- **shadcn/ui** - компоненты
- **Lucide React** - иконки

## 📦 Установка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## 🏗️ Структура проекта

```
cvety-admin-react/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui компоненты
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── badge.tsx
│   │   ├── ChatInterface.tsx    # AI чат интерфейс
│   │   ├── AdminPanel.tsx       # Админ панель
│   │   ├── ProductDialog.tsx    # Форма добавления товара
│   │   └── OrdersTable.tsx      # Таблица заказов
│   ├── lib/
│   │   └── utils.ts         # Утилиты (cn function)
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Конфигурация

### API Endpoints

Приложение использует API на `https://faq-demo.cvety.kz/`:

- `/api/chat` - AI чат endpoint
- `/api/admin/products` - Управление товарами
- `/api/orders` - Получение заказов

### Переменные окружения

Создайте файл `.env`:

```env
VITE_API_URL=https://faq-demo.cvety.kz
VITE_ADMIN_PASSWORD=your-admin-password
```

## 🚀 Деплой

### ✅ Развернуто на Cloudflare Pages

- **Основная ссылка**: https://cvety-admin-react.pages.dev
- **Временная ссылка**: https://e5a1cd26.cvety-admin-react.pages.dev  
- **Целевой домен**: admin.cvety.kz (настроить в Cloudflare Dashboard)

### Обновление деплоя

```bash
# Пересобрать и задеплоить
npm run build
wrangler pages deploy dist --project-name cvety-admin-react
```

### Настройка кастомного домена

1. Зайдите в [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Pages** → **cvety-admin-react** → **Custom domains**
3. Добавьте домен: `admin.cvety.kz`

## 📱 Компоненты

### ChatInterface
- Отправка сообщений AI
- История диалога
- Индикатор загрузки
- Время сообщений

### AdminPanel
- Статистика (карточки)
- Табы: Товары, Заказы, Аналитика
- Поиск по содержимому

### ProductDialog
- Форма добавления товара
- Валидация полей
- Выбор категории
- Загрузка изображений

### OrdersTable
- Список заказов
- Статусы с цветовой индикацией
- Фильтрация по поиску

## 🎨 Кастомизация

### Темы
Цвета определены в `src/index.css`. Поддерживается светлая и темная тема.

### Компоненты
Все UI компоненты находятся в `src/components/ui/` и могут быть изменены.

## 🔄 Следующие шаги

1. **Аутентификация** - добавить вход для админов
2. **Real-time обновления** - WebSocket для заказов
3. **Фото товаров** - загрузка и отображение
4. **Мобильная версия** - улучшить адаптивность
5. **Графики** - визуализация аналитики

## 📄 Лицензия

MIT