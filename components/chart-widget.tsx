"use client";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { ChartConfig } from "@/lib/types";

// Мягкая, насыщенная палитра — без кислотных и неоновых цветов
const COLORS = [
    "#2563eb", // глубокий синий
    "#16a34a", // зелёный
    "#e11d48", // коралловый
    "#d97706", // янтарный
    "#7c3aed", // фиолетовый
    "#0891b2", // циан
    "#be185d", // розовый
    "#ea580c", // оранжевый
];

// ===== BarChart =====
function BarChartWidget({ config }: { config: ChartConfig }) {
    return (
        <div className="w-full h-full">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 text-center">
                {config.title}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={config.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" strokeOpacity={0.2} />
                    <XAxis
                        dataKey={config.xKey}
                        tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                        axisLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                        tickLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                        axisLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                        tickLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 4px 16px rgba(148, 163, 184, 0.15)",
                            color: "var(--text-primary)",
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                    />
                    {config.dataKeys.map((key, idx) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={COLORS[idx % COLORS.length]}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ===== PieChart =====
function PieChartWidget({ config }: { config: ChartConfig }) {
    return (
        <div className="w-full h-full">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 text-center">
                {config.title}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={config.data}
                        dataKey={config.dataKeys[0]}
                        nameKey={config.xKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.5 }}
                    >
                        {config.data.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 4px 16px rgba(148, 163, 184, 0.15)",
                            color: "var(--text-primary)",
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// ===== LineChart =====
function LineChartWidget({ config }: { config: ChartConfig }) {
    return (
        <div className="w-full h-full">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 text-center">
                {config.title}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={config.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" strokeOpacity={0.2} />
                    <XAxis
                        dataKey={config.xKey}
                        tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                        axisLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                        tickLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                        axisLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                        tickLine={{ stroke: "var(--text-muted)", strokeOpacity: 0.3 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.8)",
                            borderRadius: "8px",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 4px 16px rgba(148, 163, 184, 0.15)",
                            color: "var(--text-primary)",
                        }}
                    />
                    <Legend
                        wrapperStyle={{ color: "var(--text-primary)", fontSize: 12 }}
                    />
                    {config.dataKeys.map((key, idx) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3, fill: COLORS[idx % COLORS.length] }}
                            activeDot={{ r: 5, fill: COLORS[idx % COLORS.length] }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ===== ChartWidget (root) =====
interface ChartWidgetProps {
    config: ChartConfig;
}

export default function ChartWidget({ config }: ChartWidgetProps) {
    switch (config.type) {
        case "bar":
            return <BarChartWidget config={config} />;
        case "pie":
            return <PieChartWidget config={config} />;
        case "line":
            return <LineChartWidget config={config} />;
        default:
            return null;
    }
}