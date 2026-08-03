"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, FileSpreadsheet, Loader2, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseFile, parseRawText } from "@/lib/parser";
import { MAX_FILE_SIZE_MB, MAX_TEXT_INPUT_CHARS } from "@/lib/config";
import type { ParsedData } from "@/lib/types";
import type { AppError } from "@/lib/types";

interface UploadZoneProps {
    onDataParsed: (data: ParsedData) => void;
    onError: (error: AppError) => void;
    onLoading: (status: string | null) => void;
}

type InputMode = "file" | "text";

export function UploadZone({ onDataParsed, onError, onLoading }: UploadZoneProps) {
    const [mode, setMode] = useState<InputMode>("file");
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [textValue, setTextValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const dropRef = useRef<HTMLDivElement>(null);

    const handleFile = useCallback(
        async (file: File) => {
            console.log("[UploadZone] Файл получен:", file.name, file.type, file.size);

            const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
            if (file.size > maxBytes) {
                onError({
                    title: "Файл слишком большой",
                    message: `Максимальный размер файла: ${MAX_FILE_SIZE_MB} МБ.`,
                });
                return;
            }

            setIsParsing(true);
            onLoading("Подготовка...");

            try {
                const data = await parseFile(file, onLoading);
                console.log("[UploadZone] Данные получены:", data.charCount, "символов");
                setIsParsing(false);
                onLoading("Анализируем данные через AI...");
                onDataParsed(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Неизвестная ошибка";
                console.error("[UploadZone] Ошибка:", message);
                setIsParsing(false);
                onLoading(null);
                onError({
                    title: "Ошибка обработки файла",
                    message,
                });
            }
        },
        [onDataParsed, onError, onLoading]
    );

    const handleTextSubmit = useCallback(() => {
        const trimmed = textValue.trim();
        if (!trimmed) {
            onError({
                title: "Пустой ввод",
                message: "Введите текст для анализа.",
            });
            return;
        }

        if (trimmed.length > MAX_TEXT_INPUT_CHARS) {
            onError({
                title: "Слишком много символов",
                message: `Максимум ${MAX_TEXT_INPUT_CHARS.toLocaleString("ru")} символов. Сейчас ${trimmed.length.toLocaleString("ru")}.`,
            });
            return;
        }

        setIsParsing(true);
        onLoading("Подготовка...");

        try {
            const data = parseRawText(trimmed);
            console.log("[UploadZone] Текст получен:", data.charCount, "символов");
            setIsParsing(false);
            onLoading("Анализируем данные через AI...");
            onDataParsed(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Неизвестная ошибка";
            setIsParsing(false);
            onLoading(null);
            onError({ title: "Ошибка", message });
        }
    }, [textValue, onDataParsed, onError, onLoading]);

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

    const charsLeft = MAX_TEXT_INPUT_CHARS - textValue.length;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Переключатель режимов */}
            <div className="mb-6 inline-flex rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)]">
                <button
                    onClick={() => setMode("file")}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                        mode === "file"
                            ? "bg-white text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                >
                    <Upload className="h-4 w-4" />
                    Файл
                </button>
                <button
                    onClick={() => setMode("text")}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                        mode === "text"
                            ? "bg-white text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    )}
                >
                    <MessageSquareText className="h-4 w-4" />
                    Текст
                </button>
            </div>

            {mode === "file" ? (
                /* ===== Режим "Файл" ===== */
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
                            <p className="text-lg font-medium text-[var(--text-primary)]">
                                Обрабатываем файл...
                            </p>
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
            ) : (
                /* ===== Режим "Текст" ===== */
                <div className="w-full max-w-2xl">
                    <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)]">
                        <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
                            Введите данные
                        </h2>
                        <p className="mb-4 text-sm text-[var(--text-secondary)]">
                            Вставьте неструктурированный текст, сырой отчёт или таблицу
                        </p>

                        <textarea
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            placeholder="Вставьте данные для анализа...&#10;&#10;Пример:&#10;Продажи за неделю:&#10;Пн — 150 000₽&#10;Вт — 178 000₽&#10;Ср — 162 000₽&#10;..."
                            className="h-48 w-full resize-none rounded-xl border border-[var(--glass-border)] bg-white/50 p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--text-secondary)]/40 focus:bg-white/80 focus:shadow-sm"
                            disabled={isParsing}
                        />

                        <div className="mt-3 flex items-center justify-between">
                            <span
                                className={cn(
                                    "text-xs transition-colors duration-200",
                                    charsLeft < 0
                                        ? "text-red-500"
                                        : charsLeft < 1000
                                          ? "text-amber-500"
                                          : "text-[var(--text-muted)]"
                                )}
                            >
                                {charsLeft >= 0
                                    ? `${charsLeft.toLocaleString("ru")} символов осталось`
                                    : `Превышение на ${Math.abs(charsLeft).toLocaleString("ru")} символов`}
                            </span>

                            <button
                                onClick={handleTextSubmit}
                                disabled={isParsing || !textValue.trim() || charsLeft < 0}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200",
                                    "bg-[var(--accent-blue)] text-white",
                                    "hover:opacity-90 active:scale-95",
                                    (isParsing || !textValue.trim() || charsLeft < 0) &&
                                        "pointer-events-none opacity-50"
                                )}
                            >
                                {isParsing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Обрабатываем...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquareText className="h-4 w-4" />
                                        Анализировать
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <p className="mt-4 text-xs text-[var(--text-muted)]">
                {mode === "file"
                    ? `Поддерживаются CSV, Excel, TXT, JSON • макс. ${MAX_FILE_SIZE_MB} МБ`
                    : `Максимум ${MAX_TEXT_INPUT_CHARS.toLocaleString("ru")} символов`}
            </p>
        </div>
    );
}