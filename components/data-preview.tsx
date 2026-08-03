"use client";

import { Table, FileSpreadsheet, FileText } from "lucide-react";
import { MAX_PREVIEW_LINES, MAX_PREVIEW_CHARS } from "@/lib/config";
import type { ParsedData } from "@/lib/types";

interface DataPreviewProps {
    data: ParsedData;
}

export function DataPreview({ data }: DataPreviewProps) {
    const hasTable = data.previewRows && data.previewRows.length > 0;

    return (
        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--text-muted)]/10">
                        {hasTable ? (
                            <FileSpreadsheet className="h-5 w-5 text-[var(--text-muted)]" />
                        ) : (
                            <FileText className="h-5 w-5 text-[var(--text-muted)]" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{data.fileName}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {data.lineCount.toLocaleString("ru")} строк • {data.charCount.toLocaleString("ru")} символов
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-white/50 px-3 py-1.5 text-xs text-[var(--text-muted)] backdrop-blur-sm">
                    <Table className="h-3.5 w-3.5" />
                    <span>Превью</span>
                </div>
            </div>

            {hasTable ? (
                /* Табличное превью для CSV/Excel */
                <div className="overflow-x-auto rounded-lg border border-[var(--text-muted)]/20">
                    <table className="w-full text-left text-sm">
                        <tbody>
                            {data.previewRows!.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    className={cn(
                                        "border-b border-[var(--text-muted)]/10 last:border-0 transition-colors duration-150",
                                        rowIdx === 0 ? "bg-white/60 font-medium" : "hover:bg-[var(--accent-blue)]/5"
                                    )}
                                >
                                    {row.map((cell, cellIdx) => (
                                        <td
                                            key={cellIdx}
                                            className="whitespace-nowrap px-4 py-2 font-mono text-[var(--text-primary)]"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Текстовое превью для TXT/JSON/свободного текста */
                <div className="rounded-lg border border-[var(--text-muted)]/20 bg-white/40 p-4">
                    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-[var(--text-primary)]">
                        {data.rawText.slice(0, MAX_PREVIEW_CHARS)}
                        {data.rawText.length > MAX_PREVIEW_CHARS && (
                            <span className="text-[var(--text-muted)]">...</span>
                        )}
                    </pre>
                </div>
            )}

            <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                {hasTable
                    ? `Показано ${data.previewRows!.length} из ${data.lineCount.toLocaleString("ru")} строк`
                    : `Показано ${Math.min(data.rawText.length, MAX_PREVIEW_CHARS).toLocaleString("ru")} из ${data.charCount.toLocaleString("ru")} символов`}
            </p>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(" ");
}