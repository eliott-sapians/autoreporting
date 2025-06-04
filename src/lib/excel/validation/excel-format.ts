/**
 * Excel Format Validation Orchestrator
 * Main entry point for comprehensive Excel file validation
 */

import ExcelJS from 'exceljs'
import { validateHeaders } from './excel-headers'
import { validateSpecialCells } from './excel-cells'
import { SPECIAL_CELLS, EXPECTED_COLUMN_COUNT } from '@/lib/excel/constants/columns'
import { FILE_RULES, ERROR_MESSAGES } from '@/lib/excel/constants/validation-rules'
import type { 
	ExcelStructureValidation, 
	ValidationError, 
	ValidationContext,
	ExcelFileMetadata 
} from '@/lib/excel/types/excel-format'

/**
 * Main Excel file structure validation
 */
export async function validateExcelStructure(filePath: string): Promise<ExcelStructureValidation> {
	const errors: ValidationError[] = []
	const warnings: ValidationError[] = []
	let metadata: ExcelFileMetadata | undefined
	
	try {
		// Create Excel workbook instance
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(filePath)
		
		// Get the first worksheet (assumes single sheet)
		const worksheet = workbook.getWorksheet(1)
		if (!worksheet) {
			errors.push({
				type: 'STRUCTURE',
				message: 'No worksheet found in Excel file',
				severity: 'ERROR'
			})
			return { isValid: false, errors, warnings }
		}
		
		// Create validation context
		const context: ValidationContext = {
			filename: require('path').basename(filePath),
			worksheet
		}
		
		// Validate basic structure
		const structureValidation = validateBasicStructure(worksheet, context)
		errors.push(...structureValidation.errors)
		
		// Validate special cells (B1, B5)
		const cellValidation = validateSpecialCells(worksheet, context)
		errors.push(...cellValidation.errors)
		
		// Update context with extracted values
		context.portfolioId = cellValidation.portfolioId || undefined
		context.extractDate = cellValidation.extractDate || undefined
		
		// Validate headers
		const headerValidation = validateHeaders(worksheet, context)
		errors.push(...headerValidation.errors)
		
		// Validate data rows exist
		const dataValidation = validateDataRows(worksheet, context)
		errors.push(...dataValidation.errors)
		
		// Create metadata if validation passed basic checks
		if (cellValidation.portfolioId && cellValidation.extractDate) {
			const stats = await require('fs/promises').stat(filePath)
			metadata = {
				filename: context.filename,
				filePath,
				fileSize: stats.size,
				lastModified: stats.mtime,
				portfolioId: cellValidation.portfolioId,
				extractDate: cellValidation.extractDate
			}
		}
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error reading Excel file: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		metadata
	}
}

/**
 * Validate basic Excel structure
 */
function validateBasicStructure(worksheet: ExcelJS.Worksheet, context: ValidationContext): {
	errors: ValidationError[]
} {
	const errors: ValidationError[] = []
	
	try {
		// Check if worksheet has minimum required rows
		const rowCount = worksheet.rowCount
		if (rowCount < SPECIAL_CELLS.DATA_START_ROW) {
			errors.push({
				type: 'STRUCTURE',
				message: `Excel file must have at least ${SPECIAL_CELLS.DATA_START_ROW} rows (found ${rowCount})`,
				severity: 'ERROR'
			})
		}
		
		// Check header row exists
		const headerRow = worksheet.getRow(SPECIAL_CELLS.HEADER_ROW)
		if (!headerRow || headerRow.cellCount === 0) {
			errors.push({
				type: 'STRUCTURE',
				message: `Header row ${SPECIAL_CELLS.HEADER_ROW} is empty or missing`,
				rowNumber: SPECIAL_CELLS.HEADER_ROW,
				severity: 'ERROR'
			})
		}
		
		// Check column count
		const actualColumnCount = headerRow?.actualCellCount || 0
		if (actualColumnCount !== EXPECTED_COLUMN_COUNT) {
			errors.push({
				type: 'STRUCTURE',
				message: ERROR_MESSAGES.INVALID_COLUMN_COUNT(actualColumnCount, EXPECTED_COLUMN_COUNT),
				rowNumber: SPECIAL_CELLS.HEADER_ROW,
				severity: 'ERROR'
			})
		}
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error validating basic structure: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return { errors }
}

/**
 * Validate that data rows exist
 */
function validateDataRows(worksheet: ExcelJS.Worksheet, context: ValidationContext): {
	errors: ValidationError[]
} {
	const errors: ValidationError[] = []
	
	try {
		let dataRowCount = 0
		
		// Count non-empty data rows starting from row 10
		for (let rowNum = SPECIAL_CELLS.DATA_START_ROW; rowNum <= worksheet.rowCount; rowNum++) {
			const row = worksheet.getRow(rowNum)
			
			// Check if row has any data
			let hasData = false
			for (let colNum = 1; colNum <= EXPECTED_COLUMN_COUNT; colNum++) {
				const cell = row.getCell(colNum)
				if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
					hasData = true
					break
				}
			}
			
			if (hasData) {
				dataRowCount++
			}
		}
		
		// Validate minimum data rows
		if (dataRowCount < FILE_RULES.MIN_DATA_ROWS) {
			errors.push({
				type: 'DATA',
				message: ERROR_MESSAGES.NO_DATA_ROWS,
				severity: 'ERROR'
			})
		}
		
		// Validate maximum data rows
		if (dataRowCount > FILE_RULES.MAX_DATA_ROWS) {
			errors.push({
				type: 'DATA',
				message: `Too many data rows (${dataRowCount}). Maximum allowed: ${FILE_RULES.MAX_DATA_ROWS}`,
				severity: 'ERROR'
			})
		}
		
	} catch (error) {
		errors.push({
			type: 'DATA',
			message: `Error validating data rows: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return { errors }
}

/**
 * Quick validation check (headers and structure only)
 */
export async function quickValidateExcel(filePath: string): Promise<{
	isValid: boolean
	errors: ValidationError[]
}> {
	const errors: ValidationError[] = []
	
	try {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.readFile(filePath)
		
		const worksheet = workbook.getWorksheet(1)
		if (!worksheet) {
			errors.push({
				type: 'STRUCTURE',
				message: 'No worksheet found in Excel file',
				severity: 'ERROR'
			})
			return { isValid: false, errors }
		}
		
		const context: ValidationContext = {
			filename: require('path').basename(filePath),
			worksheet
		}
		
		// Quick structure check
		const structureValidation = validateBasicStructure(worksheet, context)
		errors.push(...structureValidation.errors)
		
		// Quick header check
		const headerValidation = validateHeaders(worksheet, context)
		errors.push(...headerValidation.errors)
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error in quick validation: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return {
		isValid: errors.length === 0,
		errors
	}
}

/**
 * Validate file before processing
 */
export async function preValidateFile(filePath: string): Promise<{
	canProcess: boolean
	errors: ValidationError[]
	warnings: string[]
}> {
	const errors: ValidationError[] = []
	const warnings: string[] = []
	
	try {
		// Check file exists
		const fs = require('fs/promises')
		const stats = await fs.stat(filePath)
		
		// Check file size
		const sizeMB = stats.size / (1024 * 1024)
		if (sizeMB > FILE_RULES.MAX_SIZE_MB) {
			errors.push({
				type: 'STRUCTURE',
				message: ERROR_MESSAGES.FILE_TOO_LARGE(sizeMB),
				severity: 'ERROR'
			})
		}
		
		// Check file extension
		const path = require('path')
		const ext = path.extname(filePath).toLowerCase()
		if (ext !== '.xlsx') {
			errors.push({
				type: 'FORMAT',
				message: `Invalid file extension: ${ext}. Only .xlsx files are supported`,
				severity: 'ERROR'
			})
		}
		
		// Try to open file (basic corruption check)
		try {
			const workbook = new ExcelJS.Workbook()
			await workbook.xlsx.readFile(filePath)
		} catch (error) {
			errors.push({
				type: 'FORMAT',
				message: `File appears to be corrupted or invalid: ${error}`,
				severity: 'ERROR'
			})
		}
		
	} catch (error) {
		errors.push({
			type: 'STRUCTURE',
			message: `Error pre-validating file: ${error}`,
			severity: 'ERROR'
		})
	}
	
	return {
		canProcess: errors.length === 0,
		errors,
		warnings
	}
} 