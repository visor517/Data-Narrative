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