import { NextRequest, NextResponse } from "next/server";
import { getInsights } from "@/lib/insight-service";
import type { ParsedData } from "@/lib/parser";
import type { InsightsResponse } from "@/lib/insight-service";
import type { ErrorResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json<ErrorResponse>(
            { error: "invalid_data", message: "Тело запроса должно быть валидным JSON" },
            { status: 400 }
        );
    }

    const { headers, rows } = (body || {}) as Partial<ParsedData>;

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
        return NextResponse.json<ErrorResponse>(
            { error: "invalid_data", message: "Отсутствуют или некорректны заголовки (headers)" },
            { status: 400 }
        );
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json<ErrorResponse>(
            { error: "invalid_data", message: "Отсутствуют или некорректны строки (rows)" },
            { status: 400 }
        );
    }

    for (let i = 0; i < rows.length; i++) {
        if (typeof rows[i] !== "object" || rows[i] === null) {
            return NextResponse.json<ErrorResponse>(
                { error: "invalid_data", message: `Строка ${i + 1} должна быть объектом` },
                { status: 400 }
            );
        }
    }

    const parsedData: ParsedData = {
        headers,
        rows: rows as Record<string, string | number>[],
        fileName: (body as Record<string, unknown>)?.fileName as string || "unknown",
        rowCount: rows.length,
    };

    try {
        const insights: InsightsResponse = await getInsights(parsedData);

        return NextResponse.json<InsightsResponse>(insights, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка AI-сервиса";

        console.error("[Insights API] AI service error:", message);

        // 200, чтобы клиент мог красиво показать ошибку
        return NextResponse.json<ErrorResponse>(
            { error: "ai_failed", message },
            { status: 200 }
        );
    }
}