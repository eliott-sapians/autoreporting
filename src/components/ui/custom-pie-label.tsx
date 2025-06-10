import { ReactElement } from 'react'

interface CustomPieLabelProps {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    name: string
    percent: number
    fill?: string  // This comes from the pie chart data
    color?: string // Alternative color prop
}

export default function CustomPieLabel({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    name, 
    percent,
    fill,
    color
}: CustomPieLabelProps): ReactElement {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    // Use the actual color from the data entry
    const textColor = fill || color || 'currentColor'
    
    // Break long names intelligently
    const breakName = (text: string): string[] => {
        if (text.length <= 15) return [text]
        
        // Try to break at spaces first
        const words = text.split(' ')
        if (words.length > 1 && words[0].length <= 15) {
            const lines: string[] = []
            let currentLine = words[0]
            
            for (let i = 1; i < words.length; i++) {
                if ((currentLine + ' ' + words[i]).length <= 15) {
                    currentLine += ' ' + words[i]
                } else {
                    lines.push(currentLine)
                    currentLine = words[i]
                }
            }
            lines.push(currentLine)
            return lines
        }
        
        // Fallback: break at character limit
        const lines: string[] = []
        for (let i = 0; i < text.length; i += 15) {
            lines.push(text.slice(i, i + 15))
        }
        return lines
    }
    
    const nameLines = breakName(name)
    const percentage = `${(percent * 100).toFixed(1)}%`
    
    return (
        <text 
            x={x} 
            y={y} 
            fill={textColor}
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            className="text-md font-medium"
        >
            {nameLines.map((line, index) => (
                <tspan 
                    key={index} 
                    x={x} 
                    dy={index === 0 ? -8 * nameLines.length : 16}
                    fill={textColor}
                >
                    {line}
                </tspan>
            ))}
            <tspan 
                x={x} 
                dy={16} 
                fill={textColor}
                className="font-bold"
            >
                {percentage}
            </tspan>
        </text>
    )
} 