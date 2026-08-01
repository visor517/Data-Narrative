// ===== Application configuration =====
//
// Все константы берутся из .env (на сервере) с fallback-значениями по умолчанию.
// На клиенте process.env недоступен — там всегда используются значения по умолчанию.
// Чтобы изменить константы на клиенте, нужно править файл lib/config.ts напрямую.
//
// .env reference (только для серверных модулей):
//   MAX_FILE_SIZE_MB=20       — макс. размер загружаемого файла в МБ
//   MAX_ROWS_PARSE=1000       — макс. строк для парсинга из файла
//   MAX_ROWS_PREVIEW=5        — макс. строк для отображения в таблице предпросмотра
//   MAX_ROWS_FOR_AI=500       — макс. строк, отправляемых в AI
//   MAX_TOKENS=2000           — макс. токенов в ответе AI

// ===== File upload limits =====

/** Максимальный размер загружаемого файла в мегабайтах */
export const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 20;

/** Максимальное количество строк для парсинга из файла */
export const MAX_ROWS_PARSE = Number(process.env.MAX_ROWS_PARSE) || 1000;

/** Максимальное количество строк для отображения в таблице предпросмотра */
export const MAX_ROWS_PREVIEW = Number(process.env.MAX_ROWS_PREVIEW) || 5;

// ===== AI limits =====

/** Максимальное количество строк, отправляемых в промпт AI */
export const MAX_ROWS_FOR_AI = Number(process.env.MAX_ROWS_FOR_AI) || 500;

/** Максимальное количество токенов в ответе AI */
export const MAX_TOKENS = Number(process.env.MAX_TOKENS) || 2000;