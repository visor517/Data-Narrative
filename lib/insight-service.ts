import { z } from "zod";
import { callChat } from "@/lib/llm/gigachat";
import type { ParsedData } from "@/lib/types";
import type { ChartConfig } from "@/lib/types";

export interface InsightsResponse {
    narrative: string;
    charts: ChartConfig[];
}

// ===== Zod schema for validation =====

const ChartConfigSchema = z.object({
    type: z.enum(["bar", "pie", "line"]),
    title: z.string(),
    xKey: z.string(),
    dataKeys: z.array(z.string()).min(1),
    data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
});

const InsightsResponseSchema = z.object({
    narrative: z.string(),
    charts: z.array(ChartConfigSchema).min(1).max(3),
});

// ===== Prompt building =====

function buildPrompt(data: ParsedData): string {
    return `Ты — аналитик данных.

Вот загруженные данные:
${data.rawText}

Проанализируй данные и найди главную закономерность или аномалию.

Сформулируй инсайт на русском языке в 2-3 предложениях.

Предложи 2-3 графика для визуализации этих данных.

Верни ТОЛЬКО чистый JSON, без markdown-разметки, без пояснений, строго в следующем формате:
{
  "narrative": "текст инсайта на русском",
  "charts": [список графиков]
}

Правила построения графиков:

1. PIE-ЧАРТ (круговая диаграмма) — только если категорий ≤ 5 и нет дат:
   - xKey = колонка с названиями категорий (например, "Категория" или "Регион")
   - dataKeys = ["колонка с числами"] (одна колонка, например "Продано" или "Маржа")
   - data = массив объектов, где каждый объект — одна категория с её значением
   Пример:
   {
     "type": "pie",
     "title": "Продажи по регионам",
     "xKey": "Регион",
     "dataKeys": ["Продажи"],
     "data": [
       {"Регион": "Москва", "Продажи": 5000000},
       {"Регион": "Казань", "Продажи": 1380000}
     ]
   }

2. LINE-ЧАРТ (линейный график) — если есть временной ряд (даты, месяцы, годы):
   - xKey = колонка с датой/месяцем (например, "Месяц" или "Дата")
   - dataKeys = ["колонка1", "колонка2"] (одна или несколько числовых колонок для линий)
   - data = массив объектов, где каждый объект — одна точка времени со значениями
   Пример:
   {
     "type": "line",
     "title": "Динамика продаж и расходов",
     "xKey": "Месяц",
     "dataKeys": ["Продажи", "Расходы"],
     "data": [
       {"Месяц": "Январь", "Продажи": 1250000, "Расходы": 980000},
       {"Месяц": "Февраль", "Продажи": 1180000, "Расходы": 950000}
     ]
   }

3. BAR-ЧАРТ (столбчатая диаграмма) — для сравнения категорий:
   - xKey = колонка с названиями категорий (например, "Товар", "Поставщик", "Месяц")
   - dataKeys = ["колонка1", "колонка2"] (одна или несколько числовых колонок)
   - data = массив объектов, где каждый объект — одна категория с числами
   Пример:
   {
     "type": "bar",
     "title": "Маржа по поставщикам",
     "xKey": "Поставщик",
     "dataKeys": ["Маржа"],
     "data": [
       {"Поставщик": "ТехноТрейд", "Маржа": 28},
       {"Поставщик": "Apple Rus", "Маржа": 22}
     ]
   }

ОБЩИЕ ПРАВИЛА:
- xKey ВСЕГДА содержит текстовые метки (категории, месяцы, названия)
- dataKeys ВСЕГДА содержит числовые колонки (то, что будет отображаться на графике)
- Не клади текстовые колонки в dataKeys
- Если данных больше 20 строк — агрегируй до 15-20 точек
- Не смешивай величины разного масштаба в одном графике

Верни ТОЛЬКО чистый JSON, без markdown-разметки, строго в формате выше.
ВНИМАНИЕ: ВСЕ поля ОБЯЗАТЕЛЬНЫ: type, title, xKey, dataKeys, data.`;
}

// ===== Main function =====

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInsights(data: ParsedData): Promise<InsightsResponse> {
    const userPrompt = buildPrompt(data);
    const systemPrompt = "Ты — аналитик данных. Отвечай только в формате JSON, без markdown.";

    const promptSize = (systemPrompt.length + userPrompt.length).toLocaleString("ru");
    console.log(`[AI Service] Запрос к модели. Размер промпта: ${promptSize} символов, строк: ${data.lineCount}, источник: ${data.source}`);

    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 1) {
            const waitMs = RETRY_DELAY_MS * (attempt - 1);
            console.log(`[AI Service] Повторная попытка ${attempt}/${MAX_RETRIES} через ${waitMs}ms...`);
            await delay(waitMs);
        }

        const startTime = Date.now();
        const raw = await callChat(systemPrompt, userPrompt);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[AI Service] Ответ получен за ${elapsed}с, длина ответа: ${raw.length} символов`);

        // Пробуем распарсить JSON из ответа
        let parsed: unknown;
        try {
            const cleaned = raw
                .replace(/```json\s*/gi, "")
                .replace(/```\s*$/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch {
            console.error(`[AI Service] Попытка ${attempt}: сырой ответ AI (не JSON):`, raw);
            lastError = "Не удалось распарсить ответ AI как JSON";
            continue;
        }

        // Валидируем через Zod
        const result = InsightsResponseSchema.safeParse(parsed);

        if (!result.success) {
            console.error(`[AI Service] Попытка ${attempt}: распарсенный JSON:`, JSON.stringify(parsed, null, 2));

            const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
            lastError = `Ответ AI не прошёл валидацию: ${issues}`;
            continue;
        }

        return result.data;
    }

    throw new Error(lastError ?? "AI-сервис не смог сформировать корректный ответ после нескольких попыток");
}
