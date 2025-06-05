/**
 * File Operations for Ingestion
 * Handles moving files between directories and maintaining organization
 */

import fs from 'fs/promises'
import path from 'path'
import type { FileOperationResult } from './types'

// Directory paths
export const EXCEL_DIRECTORIES = {
	ROOT: 'data/excel',
	INCOMING: 'data/excel/incoming',
	PROCESSED: 'data/excel/processed',
	ERROR: 'data/excel/error'
} as const

/**
 * Ensure all required directories exist
 */
export async function ensureDirectoriesExist(): Promise<void> {
	const directories = Object.values(EXCEL_DIRECTORIES)
	
	for (const dir of directories) {
		try {
			await fs.mkdir(dir, { recursive: true })
		} catch {
			// Directory might already exist, that's ok
		}
	}
}

/**
 * Move processed file to appropriate directory
 */
export async function moveProcessedFile(
	originalPath: string,
	success: boolean,
	portfolioId?: string,
	extractDate?: Date
): Promise<FileOperationResult> {
	try {
		await ensureDirectoriesExist()
		
		const fileName = path.basename(originalPath)
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
		
		// Determine destination directory
		const destinationDir = success ? EXCEL_DIRECTORIES.PROCESSED : EXCEL_DIRECTORIES.ERROR
		
		// Create descriptive filename
		let newFileName = fileName
		if (success && portfolioId && extractDate) {
			const dateStr = extractDate.toISOString().split('T')[0]
			const baseName = path.parse(fileName).name
			const ext = path.parse(fileName).ext
			newFileName = `${baseName}_${portfolioId}_${dateStr}_${timestamp}${ext}`
		} else if (!success) {
			const baseName = path.parse(fileName).name
			const ext = path.parse(fileName).ext
			newFileName = `${baseName}_ERROR_${timestamp}${ext}`
		}
		
		const newPath = path.join(destinationDir, newFileName)
		
		// Move file with EXDEV error handling
		try {
			await fs.rename(originalPath, newPath)
		} catch (error: any) {
			if (error.code === 'EXDEV') {
				// Cross-device move: copy then delete
				console.log(`[FILE] Cross-device move detected, using copy+delete fallback for: ${originalPath}`)
				await fs.copyFile(originalPath, newPath)
				await fs.unlink(originalPath)
			} else {
				throw error
			}
		}
		
		console.log(`[FILE] Moved ${success ? 'successfully' : 'with errors'}: ${originalPath} → ${newPath}`)
		
		return {
			success: true,
			originalPath,
			newPath
		}
	} catch (error) {
		console.error(`[FILE] Error moving file ${originalPath}:`, error)
		return {
			success: false,
			originalPath,
			error: `Failed to move file: ${error}`
		}
	}
}

/**
 * Copy file instead of moving (useful for dry-run mode)
 */
export async function copyFile(
	sourcePath: string,
	destinationPath: string
): Promise<FileOperationResult> {
	try {
		await fs.copyFile(sourcePath, destinationPath)
		
		return {
			success: true,
			originalPath: sourcePath,
			newPath: destinationPath
		}
	} catch (error) {
		return {
			success: false,
			originalPath: sourcePath,
			error: `Failed to copy file: ${error}`
		}
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
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
	try {
		const stats = await fs.stat(filePath)
		return stats.size
	} catch {
		return 0
	}
}

/**
 * Create backup of file before processing
 */
export async function createBackup(filePath: string): Promise<FileOperationResult> {
	try {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
		const dirname = path.dirname(filePath)
		const basename = path.parse(filePath).name
		const ext = path.parse(filePath).ext
		
		const backupPath = path.join(dirname, `${basename}_backup_${timestamp}${ext}`)
		
		await fs.copyFile(filePath, backupPath)
		
		return {
			success: true,
			originalPath: filePath,
			newPath: backupPath
		}
	} catch (error) {
		return {
			success: false,
			originalPath: filePath,
			error: `Failed to create backup: ${error}`
		}
	}
}

/**
 * Clean up old backup files (older than 30 days)
 */
export async function cleanupOldBackups(directory: string, maxAgeDays: number = 30): Promise<void> {
	try {
		const files = await fs.readdir(directory)
		const cutoffDate = new Date()
		cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)
		
		for (const file of files) {
			if (file.includes('_backup_')) {
				const filePath = path.join(directory, file)
				const stats = await fs.stat(filePath)
				
				if (stats.mtime < cutoffDate) {
					await fs.unlink(filePath)
					console.log(`[FILE] Cleaned up old backup: ${filePath}`)
				}
			}
		}
	} catch (error) {
		console.warn(`[FILE] Error cleaning up backups in ${directory}:`, error)
	}
} 