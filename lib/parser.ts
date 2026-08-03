import * as XLSX from "xlsx";
import { MAX_PREVIEW_LINES, MAX_ROWS_FOR_AI } from "@/lib/config";
import type { ParsedData } from "@/lib/types";

/** Callback для уведомления о текущей стадии */
export type StageCallback = (stage: string) => void;

/**
 * Прочитать файл и вернуть ParsedData.
 * - CSV/Excel: rawText = CSV-строка, previewRows = первые N строк (ячейки)
 * - TXT/JSON: rawText = весь файл, previewRows не заполняется
 */
export function parseFile(file: File, onStage?: StageCallback): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (ext === "csv") {
            onStage?.("Читаем CSV-файл...");
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    onStage?.("Обрабатываем...");

                    const workbook = XLSX.read(text, { type: "string" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet || !sheet["!ref"]) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    // Конвертируем в CSV-строку для rawText
                    const csvString = XLSX.utils.sheet_to_csv(sheet);
                    const csvLines = csvString.split("\n");
                    const truncatedCsv = csvLines.slice(0, MAX_ROWS_FOR_AI).join("\n");

                    // Парсим первые строки для превью
                    const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
                        header: 1,
                        defval: "",
                        raw: false,
                    });

                    const previewRows = json
                        .slice(0, MAX_PREVIEW_LINES)
                        .map((row) => row.map(String));

                    resolve({
                        rawText: truncatedCsv,
                        fileName: file.name,
                        charCount: truncatedCsv.length,
                        lineCount: csvLines.length,
                        source: "file",
                        previewRows,
                    });
                } catch (err) {
                    console.error("[Parser] CSV error:", err);
                    reject(new Error("Не удалось прочитать CSV-файл. Проверьте, что это корректный CSV."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsText(file);
        } else if (ext === "xlsx" || ext === "xls") {
            onStage?.("Читаем Excel-файл...");
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    onStage?.("Распаковываем данные...");
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet || !sheet["!ref"]) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    onStage?.("Конвертируем...");

                    // CSV-строка для rawText
                    const csvString = XLSX.utils.sheet_to_csv(sheet);
                    const csvLines = csvString.split("\n");
                    const truncatedCsv = csvLines.slice(0, MAX_ROWS_FOR_AI).join("\n");

                    // Первые строки для превью
                    const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
                        header: 1,
                        defval: "",
                        raw: false,
                    });

                    const previewRows = json
                        .slice(0, MAX_PREVIEW_LINES)
                        .map((row) => row.map(String));

                    resolve({
                        rawText: truncatedCsv,
                        fileName: file.name,
                        charCount: truncatedCsv.length,
                        lineCount: csvLines.length,
                        source: "file",
                        previewRows,
                    });
                } catch (err) {
                    console.error("[Parser] XLSX error:", err);
                    reject(new Error("Не удалось прочитать Excel-файл. Проверьте, что это корректный .xlsx/.xls файл."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsArrayBuffer(file);
        } else if (ext === "txt" || ext === "json") {
            onStage?.("Читаем текстовый файл...");
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split("\n");

                    resolve({
                        rawText: text,
                        fileName: file.name,
                        charCount: text.length,
                        lineCount: lines.length,
                        source: "file",
                    });
                } catch {
                    reject(new Error("Не удалось прочитать текстовый файл."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsText(file);
        } else {
            reject(new Error("Неподдерживаемый формат. Загрузите CSV, Excel (.xlsx/.xls), .txt или .json."));
        }
    });
}

/**
 * Создать ParsedData из сырого текста (режим "Текст").
 */
export function parseRawText(text: string): ParsedData {
    const lines = text.split("\n");

    return {
        rawText: text,
        fileName: "Текстовый ввод",
        charCount: text.length,
        lineCount: lines.length,
        source: "text",
    };
}