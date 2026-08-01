// ===== YandexGPT API types =====

interface YandexGPTMessage {
    role: "system" | "user" | "assistant";
    text: string;
}

interface YandexGPTRequest {
    modelUri: string;
    completionOptions: {
        stream: boolean;
        temperature: number;
        maxTokens: number;
    };
    messages: YandexGPTMessage[];
}

interface YandexGPTResponse {
    result: {
        alternatives: Array<{
            message: {
                text: string;
            };
            status: string;
        }>;
        usage?: {
            inputTextTokens: string;
            completionTokens: string;
            totalTokens: string;
        };
    };
}

// ===== Config =====

function getEndpoint(): string {
    return (
        process.env.YANDEXGPT_API_URL ||
        "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    );
}

function getModelUri(): string {
    const folderId = process.env.YANDEX_FOLDER_ID;
    if (!folderId) {
        throw new Error("YANDEX_FOLDER_ID не задан в переменных окружения");
    }
    return `gpt://${folderId}/yandexgpt-5-lite/latest`;
}

function getApiKey(): string {
    const key = process.env.YANDEX_API_KEY;
    if (!key) {
        throw new Error("YANDEX_API_KEY не задан в переменных окружения");
    }
    return key;
}

// ===== Public API =====

/**
 * Отправляет промпт в YandexGPT и возвращает сырой текст ответа.
 * @throws Error если API недоступен или вернул ошибку
 */
export async function callChat(systemPrompt: string, userPrompt: string): Promise<string> {
    const requestBody: YandexGPTRequest = {
        modelUri: getModelUri(),
        completionOptions: {
            stream: false,
            temperature: 0.3,
            maxTokens: 2000,
        },
        messages: [
            { role: "system", text: systemPrompt },
            { role: "user", text: userPrompt },
        ],
    };

    const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Api-Key ${getApiKey()}`,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "No error body");
        console.error("YandexGPT API error:", response.status, errorText);
        throw new Error(`YandexGPT API вернул ${response.status}: ${errorText}`);
    }

    const json: YandexGPTResponse = await response.json();
    const text = json.result?.alternatives?.[0]?.message?.text;

    if (!text) {
        throw new Error("YandexGPT API вернул пустой ответ");
    }

    console.log("[YandexGPT] Tokens used:", json.result?.usage?.totalTokens);

    return text;
}