// ===== GigaChat API client =====
//
// Авторизация: двухшаговая
// 1. POST /oauth с Authorization: Basic <base64(client_id:client_secret)> → получаем access_token
// 2. Все запросы с Authorization: Bearer <access_token>
//
// Токен живёт 30 минут, кешируем в памяти.

interface GigaChatAuthResponse {
    access_token: string;
    expires_at: number;
}

interface GigaChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GigaChatRequest {
    model: string;
    messages: GigaChatMessage[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
}

interface GigaChatChoice {
    message: {
        content: string;
        role: string;
    };
    index: number;
    finish_reason: string;
}

interface GigaChatResponse {
    choices: GigaChatChoice[];
    created: number;
    model: string;
    object: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// ===== Token cache =====

let cachedToken: { token: string; expiresAt: number } | null = null;

function getAuthBaseUrl(): string {
    return (
        process.env.GIGACHAT_AUTH_URL ||
        "https://ngw.devices.sberbank.ru:9443/api/v2"
    );
}

function getApiBaseUrl(): string {
    return process.env.GIGACHAT_API_URL || "https://api.giga.chat";
}

function getClientId(): string {
    const id = process.env.GIGACHAT_CLIENT_ID;
    if (!id) throw new Error("GIGACHAT_CLIENT_ID не задан в переменных окружения");
    return id;
}

function getClientSecret(): string {
    const secret = process.env.GIGACHAT_CLIENT_SECRET;
    if (!secret) throw new Error("GIGACHAT_CLIENT_SECRET не задан в переменных окружения");
    return secret;
}

function getScope(): string {
    return process.env.GIGACHAT_SCOPE || "GIGACHAT_API_PERS";
}

function getModel(): string {
    return process.env.GIGACHAT_MODEL || "GigaChat-2";
}

// ===== Token management =====

async function obtainToken(): Promise<string> {
    const rqUid = crypto.randomUUID();

    const response = await fetch(`${getAuthBaseUrl()}/oauth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            RqUID: rqUid,
            Authorization: `Basic ${getClientSecret()}`,
        },
        body: new URLSearchParams({ scope: getScope() }),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "No error body");
        throw new Error(`GigaChat auth error ${response.status}: ${text}`);
    }

    const data: GigaChatAuthResponse = await response.json();

    cachedToken = {
        token: data.access_token,
        expiresAt: data.expires_at,
    };

    return data.access_token;
}

async function getValidToken(): Promise<string> {
    // Если токен есть и истекает не раньше чем через 5 минут — используем
    if (cachedToken && cachedToken.expiresAt > Math.floor(Date.now() / 1000) + 300) {
        return cachedToken.token;
    }

    return obtainToken();
}

// ===== Public API =====

/**
 * Отправляет промпт в GigaChat и возвращает сырой текст ответа.
 * @throws Error если API недоступен или вернул ошибку
 */
export async function callChat(systemPrompt: string, userPrompt: string): Promise<string> {
    const token = await getValidToken();

    const requestBody: GigaChatRequest = {
        model: getModel(),
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: false,
    };

    const response = await fetch(`${getApiBaseUrl()}/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "No error body");
        console.error("GigaChat API error:", response.status, errorText);
        throw new Error(`GigaChat API вернул ${response.status}: ${errorText}`);
    }

    const json: GigaChatResponse = await response.json();
    const text = json.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("GigaChat API вернул пустой ответ");
    }

    return text;
}