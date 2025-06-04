/**
 * Directory Scanner for Excel Files
 * Handles file discovery and metadata extraction
 */

import fs from 'fs/promises'
import path from 'path'
import { FILE_RULES } from '@/lib/excel/constants/validation-rules'
import { ALLOWED_EXTENSIONS } from '@/lib/excel/constants/columns'
import type { ExcelFileMetadata, ValidationError } from '@/lib/excel/types/excel-format'

// Directory paths - simplified to single directory
export const EXCEL_DIRECTORIES = {
	ROOT: 'data/excel'
} as const

/**
 * Scan directory for Excel files
 */
export async function scanForExcelFiles(directoryPath: string = EXCEL_DIRECTORIES.ROOT): Promise<{
	files: ExcelFileMetadata[]
	errors: ValidationError[]
}> {
	const files: ExcelFileMetadata[] = []
	const errors: ValidationError[] = []
	
	try {
		// Check if directory exists
		const stats = await fs.stat(directoryPath)
		if (!stats.isDirectory()) {
			errors.push({
				type: 'STRUCTURE',
				message: `Path is not a directory: ${directoryPath}`,
				severity: 'ERROR'
			})
			return { files, errors }
		}
		
		// Read directory contents
		const dirContents = await fs.readdir(directoryPath)
		
		// Filter and process Excel files
		for (const filename of dirContents) {
			const filePath = path.join(directoryPath, filename)
			
			try {
				const fileStats = await fs.stat(filePath)
				
				// Skip directories and non-files
				if (!fileStats.isFile()) {
					continue
				}
				
				// Check file extension
				const ext = path.extname(filename).toLowerCase()
				if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
					continue
				}
				
				// Create file metadata
				const metadata = await createFileMetadata(filePath, filename, fileStats)
				
				// Validate file size
				const sizeValidation = validateFileSize(metadata.fileSize!)
				if (!sizeValidation.isValid) {
					errors.push(...sizeValidation.errors)
					continue
				}
				
				// Only add files with complete metadata
				if (metadata.filename && metadata.filePath && metadata.fileSize && metadata.lastModified) {
					files.push(metadata as ExcelFileMetadata)
				}
				
			} catch (fileError) {
				errors.push({
					type: 'STRUCTURE',
					message: `Error processing file ${filename}: ${fileError}`,
					severity: 'ERROR'
				})
			}
		}
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error scanning directory ${directoryPath}: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return { files, errors }
}

/**
 * Create file metadata from file stats
 */
async function createFileMetadata(
	filePath: string, 
	filename: string, 
	stats: any
): Promise<Omit<ExcelFileMetadata, 'portfolioId' | 'extractDate'>> {
	return {
		filename,
		filePath: path.resolve(filePath),
		fileSize: stats.size,
		lastModified: stats.mtime,
	}
}

/**
 * Validate file size
 */
function validateFileSize(sizeBytes: number): {
	isValid: boolean
	errors: ValidationError[]
} {
	const errors: ValidationError[] = []
	const sizeMB = sizeBytes / (1024 * 1024)
	
	if (sizeMB > FILE_RULES.MAX_SIZE_MB) {
		errors.push({
			type: 'STRUCTURE',
			message: `File size ${sizeMB.toFixed(2)}MB exceeds maximum allowed size of ${FILE_RULES.MAX_SIZE_MB}MB`,
			severity: 'ERROR'
		})
		return { isValid: false, errors }
	}
	
	return { isValid: true, errors }
}

/**
 * Scan for Excel files in main directory
 */
export async function scanExcelFiles(): Promise<{
	files: ExcelFileMetadata[]
	errors: ValidationError[]
}> {
	return await scanForExcelFiles(EXCEL_DIRECTORIES.ROOT)
}

/**
 * Get specific file metadata
 */
export async function getFileMetadata(filePath: string): Promise<{
	metadata: Partial<ExcelFileMetadata> | null
	errors: ValidationError[]
}> {
	const errors: ValidationError[] = []
	
	try {
		const stats = await fs.stat(filePath)
		
		if (!stats.isFile()) {
			errors.push({
				type: 'STRUCTURE',
				message: `Path is not a file: ${filePath}`,
				severity: 'ERROR'
			})
			return { metadata: null, errors }
		}
		
		const filename = path.basename(filePath)
		const metadata = await createFileMetadata(filePath, filename, stats)
		
		return { metadata, errors }
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error reading file metadata for ${filePath}: ${error}`,
			severity: 'ERROR'
		})
		return { metadata: null, errors }
	}
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

/**
 * Get directory file count
 */
export async function getDirectoryFileCount(directoryPath: string): Promise<number> {
	try {
		const files = await fs.readdir(directoryPath)
		let count = 0
		
		for (const filename of files) {
			const filePath = path.join(directoryPath, filename)
			const stats = await fs.stat(filePath)
			
			if (stats.isFile() && ALLOWED_EXTENSIONS.includes(path.extname(filename).toLowerCase() as any)) {
				count++
			}
		}
		
		return count
	} catch {
		return 0
	}
}

/**
 * Ensure directory exists
 */
export async function ensureDirectoryExists(): Promise<{
	success: boolean
	errors: ValidationError[]
}> {
	const errors: ValidationError[] = []
	
	try {
		await fs.mkdir(EXCEL_DIRECTORIES.ROOT, { recursive: true })
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Failed to create directory ${EXCEL_DIRECTORIES.ROOT}: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return {
		success: errors.length === 0,
		errors
	}
} 