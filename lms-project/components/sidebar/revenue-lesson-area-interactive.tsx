"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector, Cell } from "recharts"
import { type PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ServerPoint = { date: string; enrollments: number; revenue: number }

const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

function aggregateByMonth(points: ServerPoint[]) {
    const map = new Map<number, { revenue: number; enrollments: number }>()
    for (const p of points) {
        const d = new Date(p.date)
        if (Number.isNaN(d.getTime())) continue
        const idx = d.getMonth()
        const cur = map.get(idx) ?? { revenue: 0, enrollments: 0 }
        cur.revenue += typeof p.revenue === "number" ? p.revenue : 0
        cur.enrollments += typeof p.enrollments === "number" ? p.enrollments : 0
        map.set(idx, cur)
    }

    // Only include months that have data
    const entries = Array.from(map.entries()).sort((a, b) => a[0] - b[0])
    return entries.map(([idx, v]) => ({
        monthIndex: idx,
        monthKey: MONTH_SHORT[idx].toLowerCase(),
        month: MONTH_SHORT[idx],
        revenue: v.revenue,
        lessons: v.enrollments,
    }))
}

const chartConfig = {
    revenue: { label: "Revenue", color: "var(--chart-1)" },
    lessons: { label: "Lessons", color: "var(--chart-2)" },
} satisfies ChartConfig



interface RevenueLessonAreaInteractiveProps {
    data?: ServerPoint[]
    totalRevenue?: number
}

function PieCard({
    id,
    title,
    description,
    seriesKey,
    records,
    colorOffset = 1,
    overrideValue,
}: {
    id: string
    title: string
    description: string
    seriesKey: "revenue" | "lessons"
    records: Array<{ monthIndex?: number; month: string; monthKey: string; revenue: number; lessons: number; fill?: string }>
    colorOffset?: number
    overrideValue?: number
}) {
    const defaultActive = records[0]?.monthKey ?? ""
    const [activeMonth, setActiveMonth] = React.useState(defaultActive)

    const activeIndex = React.useMemo(
        () => records.findIndex((r) => r.monthKey === activeMonth),
        [records, activeMonth]
    )

    // Each slice gets its color from the fill property (set in aggregation)
    const pieData = React.useMemo(() => {
        const chartCount = 6
        return records.map((r) => {
            const idx = typeof r.monthIndex === "number" ? r.monthIndex : 0
            const varIndex = ((idx + (colorOffset - 1)) % chartCount) + 1
            const fill = `var(--chart-${varIndex})`
            return {
                name: r.month,
                value: seriesKey === "revenue" && overrideValue !== undefined ? overrideValue : (seriesKey === "revenue" ? r.revenue : r.lessons),
                fill,
                monthKey: r.monthKey,
            }
        })
    }, [records, seriesKey, colorOffset, overrideValue])

    // Keep the active month in sync with available data. If records change,
    // default to the first month key so the selector is never 'dummy'.
    React.useEffect(() => {
        if (!pieData || pieData.length === 0) return
        const exists = pieData.some((p) => p.monthKey === activeMonth)
        if (!exists) {
            setActiveMonth(pieData[0].monthKey)
        }
    }, [pieData, activeMonth])

    return (
        <Card className="flex flex-col">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="flex flex-col justify-end">
                    <div className="grid gap-1">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Select value={activeMonth} onValueChange={setActiveMonth}>
                        <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5" aria-label="Select a value">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl">
                            {pieData.map((p) => (
                                <SelectItem key={p.monthKey} value={p.monthKey} className="rounded-lg [&_span]:flex">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="flex h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: p.fill }} />
                                        {p.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <defs>
                            {pieData.map((p, i) => (
                                <radialGradient key={`${id}-grad-${i}`} id={`grad-${id}-${i}`} cx="50%" cy="50%" r="75%">
                                    <stop offset="0%" stopColor={p.fill} stopOpacity={0.35} />
                                    <stop offset="65%" stopColor={p.fill} stopOpacity={0.6} />
                                    <stop offset="100%" stopColor={p.fill} stopOpacity={1} />
                                </radialGradient>
                            ))}
                        </defs>

                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex >= 0 ? activeIndex : undefined}
                            activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                                </g>
                            )}
                        >
                            {pieData.map((_, i) => (
                                <Cell key={`cell-${id}-${i}`} fill={`url(#grad-${id}-${i})`} />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        const displayedIndex = activeIndex >= 0 ? activeIndex : 0;
                                        let value = pieData[displayedIndex]?.value ?? 0;
                                        // If overrideValue is set and this is the revenue card, use it and format as dollars
                                        if (seriesKey === "revenue" && overrideValue !== undefined) {
                                            value = overrideValue;
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                        {`$${value.toFixed(2)}`}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                        Revenue
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {typeof value === "number" ? value.toLocaleString() : value}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    {seriesKey === "revenue" ? "Revenue" : "Lessons"}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export function RevenueLessonAreaInteractive({ data, totalRevenue }: RevenueLessonAreaInteractiveProps) {
    const [fetched, setFetched] = React.useState<ServerPoint[] | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Random color offsets for each chart so Chart1 uses --chart-X for Jan,
    // Chart2 uses a different starting var. Keep deterministic on mount.
    const [revenueColorOffset, setRevenueColorOffset] = React.useState<number>(1)
    const [lessonsColorOffset, setLessonsColorOffset] = React.useState<number>(2)

    React.useEffect(() => {
        // generate both offsets on mount to avoid impure calls during render
        const rev = Math.floor(Math.random() * 6) + 1
        let les = Math.floor(Math.random() * 6) + 1
        if (les === rev) les = (les % 6) + 1
        setRevenueColorOffset(rev)
        setLessonsColorOffset(les)
    }, [])

    React.useEffect(() => {
        if (data && data.length) return

        let cancelled = false
        setLoading(true)
        setError(null)

        // Fetch from the admin enrollments API route instead of importing server helpers
        fetch("/api/admin/enrollments?days=90")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch enrollments")
                return res.json()
            })
            .then((result) => {
                if (!cancelled) {
                    // Expecting an array of { date, enrollments, revenue }
                    setFetched(Array.isArray(result) ? result : [])
                    setLoading(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("Failed to load data")
                    setLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [data])

    const records = React.useMemo(() => {
        const source = data && data.length ? data : fetched ?? []
        if (source && source.length) {
            return aggregateByMonth(source)
        }

        // no data available — return empty records
        return []
    }, [data, fetched])

    const revenueDescription = loading
        ? "Loading data..."
        : error
            ? "Failed to load data"
            : "Revenue for the Month"

    const lessonsDescription = loading
        ? "Loading data..."
        : error
            ? "Failed to load data"
            : "Total Lessons in this Month"

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <PieCard id="pie-revenue" title="Monthly Revenue" description={revenueDescription} seriesKey="revenue" records={records} colorOffset={revenueColorOffset} overrideValue={typeof totalRevenue === 'number' ? totalRevenue : undefined} />
            <PieCard id="pie-lessons" title="Monthly Lessons" description={lessonsDescription} seriesKey="lessons" records={records} colorOffset={lessonsColorOffset} />
        </div>
    )
}
