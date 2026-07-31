import * as XLSX from "xlsx";
import type { ParsedData } from "./types";

const MAX_ROWS = 150;

export function parseFile(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
        const ext = file.name.split(".").pop()?.toLowerCase();

        if (ext === "csv") {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    // Используем XLSX.read с типом "string" — он сам определит разделители
                    const workbook = XLSX.read(text, { type: "string" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet || !sheet["!ref"]) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
                        defval: "",
                        raw: false,
                    });

                    if (json.length === 0) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    const headers = Object.keys(json[0]);
                    const rows = json.slice(0, MAX_ROWS);

                    resolve({ headers, rows, fileName: file.name, rowCount: json.length });
                } catch (err) {
                    console.error("[Parser] CSV error:", err);
                    reject(new Error("Не удалось прочитать CSV-файл. Проверьте, что это корректный CSV."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsText(file);
        } else if (ext === "xlsx" || ext === "xls") {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet || !sheet["!ref"]) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
                        defval: "",
                        raw: false,
                    });

                    if (json.length === 0) {
                        reject(new Error("Файл не содержит данных"));
                        return;
                    }

                    const headers = Object.keys(json[0]);
                    const rows = json.slice(0, MAX_ROWS);

                    resolve({ headers, rows, fileName: file.name, rowCount: json.length });
                } catch (err) {
                    console.error("[Parser] XLSX error:", err);
                    reject(new Error("Не удалось прочитать Excel-файл. Проверьте, что это корректный .xlsx/.xls файл."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsArrayBuffer(file);
        } else if (ext === "txt" || ext === "json") {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const result = parseText(text, file.name);
                    resolve(result);
                } catch {
                    reject(new Error("Не удалось распарсить текстовый файл."));
                }
            };

            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsText(file);
        } else {
            reject(new Error("Неподдерживаемый формат. Загрузите CSV, Excel (.xlsx/.xls), .txt или .json."));
        }

        console.log("[Parser] File parsed:", file.name);
    });
}

function parseText(text: string, fileName: string): ParsedData {
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length === 0) {
        throw new Error("Файл не содержит данных");
    }

    // Пробуем распарсить как TSV (табуляция) или пробелы
    const separators = ["\t", ";", ","];
    let separator = "\t";

    for (const sep of separators) {
        if (lines[0].includes(sep)) {
            separator = sep;
            break;
        }
    }

    const headers = lines[0].split(separator).map((h) => h.trim());
    const dataLines = lines.slice(1, MAX_ROWS + 1);

    const rows = dataLines.map((line) => {
        const values = line.split(separator).map((v) => v.trim());
        const row: Record<string, string | number> = {};

        headers.forEach((header, i) => {
            const val = values[i] ?? "";
            const num = Number(val);
            row[header] = isNaN(num) || val === "" ? val : num;
        });

        return row;
    });

    return { headers, rows, fileName, rowCount: lines.length - 1 };
}