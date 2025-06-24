import { ChartContainer, ChartConfig, ChartLegendContent, ChartLegend } from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { CustomizedLabel } from '@/components/ui/customized-pie-label'

interface CompositionPieChartProps {
    chartConfig: ChartConfig
    chartData: any[]
}

export default function CompositionPieChart({ chartConfig, chartData }: CompositionPieChartProps) {
    console.log('CompositionPieChart chartData:', chartData)
    
    return (
        <ChartContainer config={chartConfig} className='mt-8 w-full h-full '>
        <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={150}
                labelLine={true}
                isAnimationActive={false}
                stroke='#FFFFFF'
                strokeWidth={2}
                label={<CustomizedLabel />}
            >
                {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                ))}
            </Pie>
            </PieChart>
        </ChartContainer>
    )
}