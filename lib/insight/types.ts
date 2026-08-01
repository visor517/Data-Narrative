// ===== insight types =====

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