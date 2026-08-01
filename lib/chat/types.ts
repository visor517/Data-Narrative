// ===== chat types =====

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    data: {
        headers: string[];
        rows: Record<string, string | number>[];
    };
}

export interface ChatResponse {
    answer: string;
}