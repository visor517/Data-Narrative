import { NextRequest, NextResponse } from "next/server";
import { getChatAnswer } from "@/lib/chat/chat-service";
import type { ErrorResponse } from "@/lib/types";

interface ChatRequestBody {
    messages: { role: "user" | "assistant"; content: string }[];
    data: {
        headers: string[];
        rows: Record<string, string | number>[];
    };
}

export async function POST(request: NextRequest) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json<ErrorResponse>(
            { error: "chat_failed", message: "Тело запроса должно быть валидным JSON" },
            { status: 200 }
        );
    }

    const { messages, data } = (body || {}) as Partial<ChatRequestBody>;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json<ErrorResponse>(
            { error: "chat_failed", message: "Отсутствуют или некорректны messages" },
            { status: 200 }
        );
    }

    if (
        !data ||
        !Array.isArray(data.headers) ||
        data.headers.length === 0 ||
        !Array.isArray(data.rows) ||
        data.rows.length === 0
    ) {
        return NextResponse.json<ErrorResponse>(
            { error: "chat_failed", message: "Отсутствуют или некорректны data (headers/rows)" },
            { status: 200 }
        );
    }

    try {
        const answer = await getChatAnswer(messages, data.headers, data.rows);

        return NextResponse.json({ answer }, { status: 200 });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка AI-сервиса";
        console.error("[Chat API] AI service error:", message);

        return NextResponse.json<ErrorResponse>(
            { error: "chat_failed", message },
            { status: 200 }
        );
    }
}