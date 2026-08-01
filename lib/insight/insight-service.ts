import { z } from "zod";
import { callChat } from "@/lib/llm/gigachat";
import { MAX_ROWS_FOR_AI } from "@/lib/config";
import type { ParsedData } from "@/lib/parser";
import type { InsightsResponse } from "./types";

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
    const sampleRows = data.rows.slice(0, MAX_ROWS_FOR_AI);
    const headerLine = data.headers.join(" | ");

    const rowsText = sampleRows
        .map((row) => data.headers.map((h) => String(row[h] ?? "")).join(" | "))
        .join("\n");

    return `Ты — аналитик данных.

Вот заголовки таблицы:
${headerLine}

Вот первые ${sampleRows.length} строк данных:
${rowsText}

Проанализируй данные и найди главную закономерность или аномалию.

Сформулируй инсайт на русском языке в 2-3 предложениях.

Предложи 2-3 графика для визуализации этих данных.
Правила выбора типа графика:
- pie — если категорий не больше 5 и среди данных нет временного ряда (дат)
- line — если есть временной ряд (даты, месяцы, годы)
- bar — во всех остальных случаях (для сравнения)

Для каждого графика подготовь готовые данные в виде массива объектов, где ключи — это названия колонок, а значения — соответствующие значения.

Верни ТОЛЬКО чистый JSON, без markdown-разметки, без пояснений, строго в следующем формате:
{
  "narrative": "текст инсайта на русском",
  "charts": [
    {
      "type": "bar|pie|line",
      "title": "название графика",
      "xKey": "колонка для оси X",
      "dataKeys": ["колонка1", "колонка2"],
      "data": [
        { "колонка1": "значение1", "колонка2": "значение2" }
      ]
    }
  ]
}`;
}

// ===== Main function =====

export async function getInsights(data: ParsedData): Promise<InsightsResponse> {
    const userPrompt = buildPrompt(data);
    const systemPrompt = "Ты — аналитик данных. Отвечай только в формате JSON, без markdown.";

    const raw = await callChat(systemPrompt, userPrompt);

    // Пробуем распарсить JSON из ответа
    // Иногда модель может обернуть JSON в markdown-код
    let parsed: unknown;
    try {
        const cleaned = raw
            .replace(/```json\s*/gi, "")
            .replace(/```\s*$/g, "")
            .trim();
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Не удалось распарсить ответ AI как JSON");
    }

    // Валидируем через Zod
    const result = InsightsResponseSchema.safeParse(parsed);

    if (!result.success) {
        const issues = result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        throw new Error(`Ответ AI не прошёл валидацию: ${issues}`);
    }
    // console.log("[AI Service] Parsed response:", JSON.stringify(result.data, null, 2));
    return result.data;
}