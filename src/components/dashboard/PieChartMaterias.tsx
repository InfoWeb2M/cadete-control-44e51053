import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { MateriaPerformance } from "@/lib/types";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#ec4899"];

interface PieChartMateriasProps {
    data: MateriaPerformance[];
}

export default function PieChartMaterias({ data }: PieChartMateriasProps) {
    const chartConfig = useMemo((): ChartConfig => {
        const config: ChartConfig = {};
        if (!data || !Array.isArray(data)) return config;
        data.forEach((item, index) => {
            config[item.materia.nome] = {
                color: COLORS[index % COLORS.length],
            };
        });
        return config;
    }, [data]);

    const pieData = data.map(item => ({
        materia: item.materia.nome,
        ipr: Math.max(item.ipr, 0.1), // Avoid zero slices
    }));

    if (!pieData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium tracking-wider uppercase text-muted-foreground">
                        Distribuição IPR por Matéria
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center text-muted-foreground">Nenhuma matéria disponível</CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground pb-2">
                    Distribuição de IPR por Matéria
                </CardTitle>
                <p className="text-sm text-muted-foreground px-2">
                    {pieData.reduce((sum, d) => sum + d.ipr, 0).toFixed(0)}% total IPR
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-64 w-full p-4 md:p-6 flex gap-6">
                    <div className="flex-1">
                        <ChartContainer config={chartConfig} className="h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="ipr"
                                        nameKey="materia"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="40%"
                                        outerRadius="70%"
                                        paddingAngle={1}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                    <div className="w-32 flex flex-col gap-3 self-stretch">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Legenda
                        </span>
                        {pieData.map((entry, index) => (
                            <div key={entry.materia} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full ring-1 ring-background"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs font-medium truncate">{entry.materia}</span>
                                <span className="ml-auto text-xs font-mono">{entry.ipr.toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
