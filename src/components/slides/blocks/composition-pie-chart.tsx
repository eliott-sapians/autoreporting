import { ChartContainer, ChartConfig, ChartLegendContent, ChartLegend } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import CustomPieLabel from '@/components/ui/custom-pie-label'

interface CompositionPieChartProps {
    chartConfig: ChartConfig
    chartData: any[]
}

export default function CompositionPieChart({ chartConfig, chartData }: CompositionPieChartProps) {
    return (
        <ChartContainer config={chartConfig} className='mt-8 w-full h-full overflow-visible'>
        <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={120}
                label={CustomPieLabel}
                labelLine={false}
            >
                {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                ))}
            </Pie>
            </PieChart>
        </ChartContainer>
    )
}