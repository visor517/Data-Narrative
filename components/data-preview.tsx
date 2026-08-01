"use client";

import { Table, FileSpreadsheet } from "lucide-react";
import type { ParsedData } from "@/lib/parser";

interface DataPreviewProps {
    data: ParsedData;
}

export function DataPreview({ data }: DataPreviewProps) {
    const previewRows = data.rows.slice(0, 5);

    return (
        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--text-muted)]/10">
                        <FileSpreadsheet className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{data.fileName}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {data.rowCount} строк • {data.headers.length} колонок
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-white/50 px-3 py-1.5 text-xs text-[var(--text-muted)] backdrop-blur-sm">
                    <Table className="h-3.5 w-3.5" />
                    <span>Превью</span>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[var(--text-muted)]/20">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--text-muted)]/20 bg-white/40">
                            {data.headers.map((header) => (
                                <th
                                    key={header}
                                    className="whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {previewRows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-[var(--text-muted)]/10 last:border-0 transition-colors duration-150 hover:bg-[var(--accent-blue)]/5"
                            >
                                {data.headers.map((header) => (
                                    <td key={header} className="whitespace-nowrap px-4 py-2 font-mono text-[var(--text-primary)]">
                                        {row[header] ?? ""}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.rowCount > 5 && (
                <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
                    Показано 5 из {data.rowCount} строк
                </p>
            )}
        </div>
    );
}