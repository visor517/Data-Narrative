"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/upload-zone";
import { DataPreview } from "@/components/data-preview";
import { NarrativeWidget } from "@/components/narrative-widget";
import ChartWidget from "@/components/chart-widget";
import { ErrorState } from "@/components/ui/error-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import type { ParsedData, AppState, AppError, ChartConfig } from "@/lib/types";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleDataParsed = useCallback(async (data: ParsedData) => {
    setParsedData(data);
    setError(null);
    setAppState("dashboard");
    setNarrative(null);
    setCharts(null);

    // Отправляем данные в AI-сервис
    setAiLoading(true);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: data.headers,
          rows: data.rows,
          fileName: data.fileName,
        }),
      });

      const result = await response.json();

      if (result.error === "ai_failed") {
        setError({ title: "Ошибка AI-анализа", message: result.message });
        setAppState("error");
      } else {
        setNarrative(result.narrative);
        setCharts(result.charts);
      }
    } catch {
      setError({
        title: "Ошибка сети",
        message: "Не удалось связаться с сервером. Попробуйте ещё раз.",
      });
      setAppState("error");
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleError = useCallback((err: AppError) => {
    setError(err);
    setParsedData(null);
    setNarrative(null);
    setCharts(null);
    setAppState("error");
  }, []);

  const handleLoading = useCallback((loading: boolean) => {
    setAppState(loading ? "loading" : "idle");
  }, []);

  const handleReset = useCallback(() => {
    setParsedData(null);
    setError(null);
    setNarrative(null);
    setCharts(null);
    setAppState("idle");
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Data Narrative
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Загрузите данные и получите AI-аналитику
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {appState === "idle" && <UploadZone onDataParsed={handleDataParsed} onError={handleError} onLoading={handleLoading} />}

        {appState === "loading" && (
          <div className="py-12">
            <DashboardSkeleton />
          </div>
        )}

        {appState === "error" && error && (
          <div className="space-y-6">
            <ErrorState error={error} onDismiss={handleReset} />
            <UploadZone onDataParsed={handleDataParsed} onError={handleError} onLoading={handleLoading} />
          </div>
        )}

        {appState === "dashboard" && parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between animate-fade-in-up">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Данные загружены</h2>
              <button
                onClick={handleReset}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm text-[var(--text-primary)] shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:bg-white/80 hover:shadow-lg active:scale-95"
              >
                Загрузить другой файл
              </button>
            </div>

            <div className="animate-fade-in-up">
              <DataPreview data={parsedData} />
            </div>

            {/* AI-аналитика */}
            {aiLoading && (
              <div className="py-12">
                <DashboardSkeleton />
              </div>
            )}

            {!aiLoading && (narrative || (charts && charts.length > 0)) && (
              <div className="space-y-6">
                {narrative && (
                  <div className="animate-fade-in-up">
                    <NarrativeWidget narrative={narrative} />
                  </div>
                )}

                {charts && charts.length > 0 && (
                  <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${charts.length}, minmax(0, 1fr))` }}
                  >
                    {charts.map((chart, i) => (
                      <div
                        key={i}
                        className="glass-card animate-fade-in-up rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)]"
                        style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                      >
                        <ChartWidget config={chart} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

