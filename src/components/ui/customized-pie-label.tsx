'use client'

import React from 'react'

interface CustomizedLabelProps {
	cx?: number
	cy?: number
	midAngle?: number
	innerRadius?: number
	outerRadius?: number
	name?: string
}

const RADIAN = Math.PI / 180

export const CustomizedLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, name }: CustomizedLabelProps) => {
	// Guard against missing name
	if (!name) return null

	// ---------- Position calculations ----------
	// Adjust the multiplier to change the distance of the label from the chart
	const radius = innerRadius + (outerRadius - innerRadius) * 1.3
	const x = cx + radius * Math.cos(-midAngle * RADIAN)
	const y = cy + radius * Math.sin(-midAngle * RADIAN)

	// ---------- Text wrapping logic ----------
	const fontSize = 16
	const maxCharsPerLine = 7

	const wrapText = (text: string) => {
		// If the text is already short enough, return as single line
		if (text.length <= maxCharsPerLine) return [text]

		const words = text.split(' ')
		// If there are no spaces, return the original word even if it exceeds the limit
		if (words.length === 1) return [text]

		const lines: string[] = []
		let currentLine = ''

		for (const word of words) {
			// If adding the next word would exceed the limit, push the current line and start a new one
			if ((currentLine + (currentLine ? ' ' : '') + word).length > maxCharsPerLine) {
				if (currentLine) lines.push(currentLine)
				currentLine = word
			} else {
				currentLine += (currentLine ? ' ' : '') + word
			}
		}

		if (currentLine) lines.push(currentLine)

		return lines
	}

	const lines = wrapText(String(name))

	return (
		<text
			x={x}
			y={y - ((lines.length - 1) * (fontSize + 2)) / 2} // shift up to vertically center multi-line block
			fill='var(--primary-foreground)'
			textAnchor={x > cx ? 'start' : 'end'}
			dominantBaseline='central'
			fontSize={fontSize}
		>
			{lines.map((ln, idx) => (
				<tspan key={idx} x={x} dy={idx === 0 ? 0 : fontSize + 2}>
					{ln}
				</tspan>
			))}
		</text>
	)
} 