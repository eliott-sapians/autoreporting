/**
 * TypeScript Types for Excel Format Validation
 */

import type { ColumnLetter, FieldName } from '@/lib/excel/constants/columns'

// Excel file metadata
export interface ExcelFileMetadata {
	filename: string
	filePath: string
	fileSize: number
	lastModified: Date
	portfolioId: string
	extractDate: Date
}

// Excel structure validation result
export interface ExcelStructureValidation {
	isValid: boolean
	errors: ValidationError[]
	warnings: ValidationWarning[]
	metadata?: ExcelFileMetadata
}

// Validation error with cell reference
export interface ValidationError {
	type: 'STRUCTURE' | 'HEADER' | 'CELL' | 'DATA' | 'FORMAT'
	message: string
	cellReference?: string
	rowNumber?: number
	columnLetter?: ColumnLetter
	severity: 'ERROR' | 'WARNING'
}

// Validation warning
export interface ValidationWarning {
	message: string
	cellReference?: string
	suggestion?: string
}

// Excel row data (mapped to database fields)
export interface ExcelRowData {
	balance: number | null
	label: string | null
	currency: string | null
	valuation_eur: number | null
	weight_pct: number | null
	isin: string | null
	pnl_eur: number | null
	fees_eur: number | null
	asset_name: string | null
	strategy: string | null
	bucket: string | null
}

// Raw Excel cell value
export interface ExcelCellValue {
	value: any
	type: 'string' | 'number' | 'date' | 'boolean' | 'formula' | 'null'
	address: string
}

// Excel header validation result
export interface HeaderValidationResult {
	isValid: boolean
	errors: ValidationError[]
	columnMapping: Partial<Record<ColumnLetter, FieldName>>
}

// File processing result
export interface FileProcessingResult {
	success: boolean
	filename: string
	portfolioId?: string
	extractDate?: Date
	rowsProcessed?: number
	errors: ValidationError[]
	warnings: ValidationWarning[]
	movedTo?: 'processed' | 'error'
	processingTime?: number
}

// Excel validation context
export interface ValidationContext {
	filename: string
	worksheet: any // exceljs worksheet
	currentRow?: number
	currentColumn?: ColumnLetter
	portfolioId?: string
	extractDate?: Date
}

// Column validation rule
export interface ColumnValidationRule {
	required: boolean
	type: 'string' | 'number' | 'date' | 'currency' | 'isin'
	maxLength?: number
	pattern?: RegExp
	allowedValues?: string[]
	numericPrecision?: { precision: number; scale: number }
}

// File movement operation
export interface FileMoveOperation {
	from: string
	to: string
	operation: 'move' | 'copy'
	createBackup: boolean
}

// Batch validation result
export interface BatchValidationResult {
	totalFiles: number
	validFiles: number
	invalidFiles: number
	results: FileProcessingResult[]
	overallErrors: ValidationError[]
} 