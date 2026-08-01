"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile } from "@/lib/parser";
import type { ParsedData } from "@/lib/parser";
import type { AppError } from "@/lib/types";

interface UploadZoneProps {
    onDataParsed: (data: ParsedData) => void;
    onError: (error: AppError) => void;
    onLoading: (loading: boolean) => void;
}

export function UploadZone({ onDataParsed, onError, onLoading }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            console.log("[UploadZone] Файл получен:", file.name, file.type, file.size);
            setIsParsing(true);
            onLoading(true);

            try {
                const data = await parseFile(file);
                console.log("[UploadZone] Данные распаршены:", data.rowCount, "строк");
                setIsParsing(false);
                onDataParsed(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Неизвестная ошибка";
                console.error("[UploadZone] Ошибка:", message);
                setIsParsing(false);
                onError({
                    title: "Ошибка обработки файла",
                    message,
                });
            }
        },
        [onDataParsed, onError, onLoading]
    );

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[UploadZone] drop event");
            setIsDragging(false);
            const file = e.dataTransfer?.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleClick = () => inputRef.current?.click();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    useEffect(() => {
        const el = dropRef.current;
        if (!el) return;

        el.addEventListener("dragover", handleDragOver);
        el.addEventListener("drop", handleDrop);
        el.addEventListener("dragleave", handleDragLeave);

        return () => {
            el.removeEventListener("dragover", handleDragOver);
            el.removeEventListener("drop", handleDrop);
            el.removeEventListener("dragleave", handleDragLeave);
        };
    }, [handleDragOver, handleDrop, handleDragLeave]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div
                ref={dropRef}
                onClick={handleClick}
                className={cn(
                    "group relative cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300",
                    "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] shadow-[var(--glass-shadow)]",
                    "border-[var(--text-muted)]/30",
                    "hover:border-[var(--text-muted)]/60 hover:bg-white/70 hover:shadow-lg",
                    isDragging
                        ? "border-[var(--text-secondary)]/60 bg-white/80 scale-[1.02] shadow-lg"
                        : "",
                    isParsing && "pointer-events-none opacity-60"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt,.json"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {isParsing ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-blue)]" />
                        <p className="text-lg font-medium text-[var(--text-primary)]">Обрабатываем файл...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--text-muted)]/10">
                                <Upload className="h-7 w-7 text-[var(--text-muted)]" />
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--text-muted)]/10">
                                <FileSpreadsheet className="h-7 w-7 text-[var(--text-muted)]" />
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--text-muted)]/10">
                                <FileText className="h-7 w-7 text-[var(--text-muted)]" />
                            </div>
                        </div>

                        <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
                            Загрузите файл с данными
                        </h2>
                        <p className="mb-6 text-sm text-[var(--text-secondary)]">
                            Перетащите файл сюда или нажмите для выбора
                        </p>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-white/50 px-4 py-2 text-xs text-[var(--text-muted)] backdrop-blur-sm">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>CSV</span>
                            <span className="text-[var(--text-muted)]/40">•</span>
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Excel</span>
                            <span className="text-[var(--text-muted)]/40">•</span>
                            <FileText className="h-4 w-4" />
                            <span>TXT / JSON</span>
                        </div>
                    </>
                )}
            </div>

            <p className="mt-4 text-xs text-[var(--text-muted)]">
                До 150 строк • Первая строка — заголовки
            </p>
        </div>
    );
}