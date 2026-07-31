import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppError } from "@/lib/types";

interface ErrorStateProps {
    error: AppError;
    onDismiss?: () => void;
}

export function ErrorState({ error, onDismiss }: ErrorStateProps) {
    return (
        <div
            className={cn(
                "relative rounded-xl border p-6",
                "border-[var(--error-border)] bg-[var(--error-bg)]",
                "backdrop-blur-[var(--glass-blur)] transition-all duration-300"
            )}
        >
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--error-border)]">
                    <AlertTriangle className="h-5 w-5 text-[var(--error-text)]" />
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold text-[var(--error-text)]">{error.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{error.message}</p>
                </div>
            </div>
        </div>
    );
}