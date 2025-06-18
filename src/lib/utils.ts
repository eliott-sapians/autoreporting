import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Downloads a file from a fetch Response
 * @param response - The fetch Response object
 * @param fileName - The filename to save as
 */
export async function downloadFileFromResponse(
	response: Response,
	fileName: string
): Promise<void> {
	if (!response.ok) {
		throw new Error(`Download failed: ${response.status} ${response.statusText}`)
	}

	const blob = await response.blob()
	const url = URL.createObjectURL(blob)
	
	try {
		const link = document.createElement('a')
		link.href = url
		link.download = fileName
		link.style.display = 'none'
		
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	} finally {
		URL.revokeObjectURL(url)
	}
}
