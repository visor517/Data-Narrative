// ===== Application configuration =====
//
// Все константы берутся из .env (на сервере) с fallback-значениями по умолчанию.
// На клиенте process.env недоступен — там всегда используются значения по умолчанию.
// Чтобы изменить константы на клиенте, нужно править файл lib/config.ts напрямую.
//
// .env reference (только для серверных модулей):
//   MAX_FILE_SIZE_MB=5         — макс. размер загружаемого файла в МБ
//   MAX_PREVIEW_LINES=7        — макс. строк для предпросмотра (включая заголовок)
//   MAX_PREVIEW_CHARS=500      — макс. символов для предпросмотра текста
//   MAX_TEXT_INPUT_CHARS=10000 — макс. символов для ручного ввода
//   MAX_ROWS_FOR_AI=1000       — макс. строк, отправляемых в AI
//   MAX_TOKENS=2000            — макс. токенов в ответе AI

// ===== File upload limits =====

/** Максимальный размер загружаемого файла в мегабайтах */
export const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 5;

// ===== Preview limits =====

/** Максимальное количество строк для предпросмотра (включая заголовок) */
export const MAX_PREVIEW_LINES = Number(process.env.MAX_PREVIEW_LINES) || 7;

/** Максимальное количество символов для предпросмотра текста */
export const MAX_PREVIEW_CHARS = Number(process.env.MAX_PREVIEW_CHARS) || 500;

// ===== Input limits =====

/** Максимальное количество символов для ручного ввода текста */
export const MAX_TEXT_INPUT_CHARS = Number(process.env.MAX_TEXT_INPUT_CHARS) || 10000;

// ===== AI limits =====

/** Максимальное количество строк, отправляемых в промпт AI */
export const MAX_ROWS_FOR_AI = Number(process.env.MAX_ROWS_FOR_AI) || 1000;

/** Максимальное количество токенов в ответе AI */
export const MAX_TOKENS = Number(process.env.MAX_TOKENS) || 2000;