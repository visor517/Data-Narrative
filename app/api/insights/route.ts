import { NextRequest, NextResponse } from "next/server";
import { getInsights } from "@/lib/insight-service";
import type { ParsedData } from "@/lib/types";
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

    const { rawText, fileName } = (body || {}) as Partial<ParsedData>;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        return NextResponse.json<ErrorResponse>(
            { error: "invalid_data", message: "Отсутствуют или некорректны rawText" },
            { status: 400 }
        );
    }

    const parsedData: ParsedData = {
        rawText,
        fileName: (body as Record<string, unknown>)?.fileName as string || "unknown",
        charCount: rawText.length,
        lineCount: rawText.split("\n").length,
        source: "file",
    };

    try {
        const insights: InsightsResponse = await getInsights(parsedData);

        return NextResponse.json<InsightsResponse>(insights, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка AI-сервиса";

        console.error("[Insights API] AI service error:", message);

        return NextResponse.json<ErrorResponse>(
            { error: "ai_failed", message },
            { status: 200 }
        );
    }
}