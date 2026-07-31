// ===== app/page types =====

export type AppState = "idle" | "loading" | "dashboard" | "error";

export interface AppError {
    title: string;
    message: string;
}

// ===== data/graph types =====

export interface ParsedData {
    headers: string[];
    rows: Record<string, string | number>[];
    fileName: string;
    rowCount: number;
}

export type ChartType = "bar" | "pie" | "line";

export interface ChartConfig {
    type: ChartType;
    title: string;
    xKey: string;
    dataKeys: string[];
    data: Record<string, string | number>[];
}

export interface InsightsResponse {
    narrative: string;
    charts: ChartConfig[];
}

export interface ErrorResponse {
    error: string;
    message: string;
}