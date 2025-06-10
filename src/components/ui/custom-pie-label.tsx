interface LabelFormatterProps {
    value: any
    name?: string
    percent?: number
    index?: number
    // Recharts might pass additional props
    [key: string]: any
}

/**
 * Custom formatter for LabelList that shows full fund names with line breaking
 */
export function customPieLabelFormatter(props: any): string {
    console.log('customPieLabelFormatter received props:', props)
    
    try {
        // Try different ways to extract the name
        let name = ''
        
        // Method 1: Direct value (this is often what LabelList passes as first param)
        if (props.value && typeof props.value === 'string') {
            name = props.value
        }
        
        // Method 2: Direct props
        if (!name && props.name) {
            name = String(props.name)
        }
        
        // Method 3: From payload
        if (!name && props.payload) {
            name = String(props.payload.name || props.payload.label || props.payload.key || '')
        }
        
        // Method 4: Check if first argument is the actual value
        if (!name && arguments.length > 0 && typeof arguments[0] === 'string') {
            name = arguments[0]
        }
        
        console.log('Extracted name:', name)
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            console.log('No valid name found, returning empty')
            return ''
        }

        // Break long names into lines with proper SVG formatting
        const breakNameIntoLines = (text: string): string => {
            if (!text || text.length <= 15) return text
            
            // Try to break at spaces first for natural word boundaries
            const words = text.split(' ')
            if (words.length > 1) {
                const lines = []
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
                return lines.join('\n')
            }
            
            // For very long single words, break at character boundaries
            const lines = []
            for (let i = 0; i < text.length; i += 15) {
                lines.push(text.slice(i, i + 15))
            }
            return lines.join('\n')
        }
        
        const result = breakNameIntoLines(name)
        console.log('Final result:', result)
        return result
        
    } catch (error) {
        console.error('Error in customPieLabelFormatter:', error, props)
        return ''
    }
}

/**
 * Alternative formatter that shows just the first word for very compact spaces
 */
export function compactPieLabelFormatter(props: any): string {
    try {
        let name = ''
        
        if (props.value && typeof props.value === 'string') {
            name = props.value
        } else if (props.name) {
            name = String(props.name)
        } else if (props.payload) {
            name = String(props.payload.name || props.payload.label || props.payload.key || '')
        } else if (arguments.length > 0 && typeof arguments[0] === 'string') {
            name = arguments[0]
        }
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return ''
        }
        
        // For compact version, just show first word
        const firstWord = name.split(' ')[0]
        return firstWord
        
    } catch (error) {
        console.error('Error in compactPieLabelFormatter:', error, props)
        return ''
    }
} 