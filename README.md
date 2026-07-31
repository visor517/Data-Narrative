# Data Narrative

Загрузите CSV, Excel или текст — получите AI-аналитику с графиками.

## Возможности

- Drag-and-drop загрузка CSV/Excel/текста
- AI-инсайт — модель находит главную закономерность в данных
- Автоматический подбор графиков (line, bar, pie)
- Чат с данными — задайте вопрос по загруженному файлу

## Стек

- Фронтенд: Next.js 15, React 19, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- Бэкенд: Next.js API Routes (Serverless)
- AI: GigaChat API (Сбер)
- Деплой: Vercel

## Переменные окружения

Создайте .env.local:
```
GIGACHAT_CLIENT_ID=ваш-client-id
GIGACHAT_CLIENT_SECRET=ваш-client-secret
MAX_ROWS_FOR_AI=30
```

## Запуск

npm install
npm run dev

Открыть http://localhost:3000

## Деплой

Проект готов к деплою на Vercel одной командой. Добавьте переменные окружения в настройках проекта.