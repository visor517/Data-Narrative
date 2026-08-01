// ===== app/page types =====

export type AppState = "idle" | "loading" | "dashboard" | "error";

export interface AppError {
    title: string;
    message: string;
}

// ===== error types =====

export interface ErrorResponse {
    error: string;
    message: string;
}

// ===== chart types =====

export type ChartType = "bar" | "pie" | "line";

export interface ChartConfig {
    type: ChartType;
    title: string;
    xKey: string;
    dataKeys: string[];
    data: Record<string, string | number>[];
}

// ===== chat types =====

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}