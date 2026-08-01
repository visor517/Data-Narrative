"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
    messages: ChatMessage[];
    onSend: (message: string) => void;
    loading: boolean;
}

export function ChatPanel({ messages, onSend, loading }: ChatPanelProps) {
    const [input, setInput] = useState("");
    const listRef = useRef<HTMLDivElement>(null);

    // Автоскролл к последнему сообщению
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;
        onSend(trimmed);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-[var(--glass-border)] px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-muted)]/10">
                    <svg
                        className="h-4 w-4 text-[var(--text-muted)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Чат с данными
                </h3>
            </div>

            {/* Messages */}
            <div
                ref={listRef}
                className="flex max-h-80 flex-col gap-3 overflow-y-auto px-5 py-4"
            >
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <svg
                            className="mb-2 h-10 w-10 text-[var(--text-muted)]/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                            />
                        </svg>
                        <p className="text-sm text-[var(--text-muted)]">
                            Задайте вопрос о загруженных данных
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                        style={{ animationDelay: "0s" }}
                    >
                        <div
                            className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                ? "bg-[var(--accent-blue)]/20 text-[var(--text-primary)]"
                                : "bg-[var(--accent-green)]/10 text-[var(--text-primary)]"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-fade-in-up">
                        <div className="max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-muted)]" />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-muted)]" style={{ animationDelay: "0.2s" }} />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-muted)]" style={{ animationDelay: "0.4s" }} />
                                AI думает...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-[var(--glass-border)] px-5 py-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Спросите что-нибудь про данные..."
                    disabled={loading}
                    className="flex-1 rounded-xl border border-[var(--glass-border)] bg-white/40 px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all duration-200 focus:border-[var(--accent-blue)]/30 focus:bg-white/60 focus:shadow-sm disabled:opacity-50"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-blue)] text-white shadow-sm transition-all duration-200 hover:bg-[var(--accent-blue)]/90 active:scale-95 disabled:opacity-40 disabled:hover:bg-[var(--accent-blue)]"
                >
                    {loading ? (
                        <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 12h14M12 5l7 7-7 7"
                            />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}