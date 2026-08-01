import { callChat } from "@/lib/llm/gigachat";

// ===== Prompt building =====

function buildSystemPrompt(headers: string[], rows: Record<string, string | number>[]): string {
    const maxRows = Number(process.env.MAX_ROWS_FOR_AI) || 30;
    const sampleRows = rows.slice(0, maxRows);
    const headerLine = headers.join(" | ");

    const rowsText = sampleRows
        .map((row) => headers.map((h) => String(row[h] ?? "")).join(" | "))
        .join("\n");

    return `Ты — аналитик данных. Отвечай на вопросы пользователя строго на основе предоставленных данных.

Вот заголовки таблицы:
${headerLine}

Вот первые ${sampleRows.length} строк данных:
${rowsText}

ВАЖНЫЕ ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе данных выше.
2. Если в данных нет информации для ответа — скажи: "В этом отчёте нет такой информации."
3. Не придумывай факты, числа или выводы, которых нет в данных.
4. Отвечай кратко и по существу.
5. Не используй markdown-разметку, отвечай обычным текстом.`;
}

// ===== Main function =====

export async function getChatAnswer(
    messages: { role: "user" | "assistant"; content: string }[],
    headers: string[],
    rows: Record<string, string | number>[]
): Promise<string> {
    const systemPrompt = buildSystemPrompt(headers, rows);

    // Берём последнее сообщение пользователя как основной запрос
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    // Формируем контекст из предыдущих сообщений (история диалога)
    const historyContext = messages
        .slice(0, -1)
        .map((m) => `${m.role === "user" ? "Пользователь" : "Ассистент"}: ${m.content}`)
        .join("\n");

    const userPrompt = historyContext
        ? `${historyContext}\n\nПользователь: ${lastUserMessage}`
        : lastUserMessage;

    return callChat(systemPrompt, userPrompt);
}