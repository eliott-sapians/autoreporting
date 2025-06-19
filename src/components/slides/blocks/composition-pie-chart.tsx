import { ChartContainer, ChartConfig, ChartLegendContent, ChartLegend } from '@/components/ui/chart'
import { PieChart, Pie, Cell, LabelList } from 'recharts'
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { customPieLabelFormatter } from '@/components/ui/custom-pie-label'

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
                outerRadius={180}
                labelLine={true}
                isAnimationActive={false}
            >
                {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                ))}
                <LabelList
                    dataKey="name"
                    className="fill-white font-medium text-base"
                    stroke="none"
                    fontSize={14}
                    formatter={(value: any, name: any, props: any) => {
                        console.log('LabelList formatter - value:', value, 'name:', name, 'props:', props)
                        const result = customPieLabelFormatter({ value, name, ...props })
                        console.log('LabelList formatter result:', result)
                        return result
                    }}
                />
            </Pie>
            </PieChart>
        </ChartContainer>
    )
}