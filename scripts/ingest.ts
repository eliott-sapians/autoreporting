#!/usr/bin/env tsx

/**
 * Ingestion CLI Script
 * Entry point for `npm run ingest` command
 */

import { config } from 'dotenv'
import { createInterface } from 'readline'
import { ingestExcelFiles } from '../src/lib/ingestion/ingestion-service'
import type { IngestionOptions, IngestionResult } from '../src/lib/ingestion/types'

// Load environment variables first
config({ path: '.env.local' })

// ANSI color codes for console output
const colors = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
	bold: '\x1b[1m'
}

/**
 * Parse command line arguments
 */
function parseArguments(): IngestionOptions {
	const args = process.argv.slice(2)
	const options: IngestionOptions = {
		continueOnError: true // Default to continue on error
	}

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]
		
		switch (arg) {
			case '--file':
			case '-f':
				options.filePath = args[++i]
				if (!options.filePath) {
					console.error(`${colors.red}Error: --file requires a filename${colors.reset}`)
					process.exit(1)
				}
				break
				
			case '--force':
				options.force = true
				break
				
			case '--dry-run':
			case '--dry':
				options.dryRun = true
				break
				
			case '--skip-validation':
				options.skipValidation = true
				break
				
			case '--stop-on-error':
				options.continueOnError = false
				break
				
			case '--help':
			case '-h':
				showHelp()
				process.exit(0)
				break
				
			default:
				if (arg.startsWith('-')) {
					console.error(`${colors.red}Unknown option: ${arg}${colors.reset}`)
					console.log(`Use --help for usage information`)
					process.exit(1)
				} else {
					// Treat as filename if no --file was specified
					if (!options.filePath) {
						options.filePath = arg
					}
				}
		}
	}

	return options
}

/**
 * Show help information
 */
function showHelp(): void {
	console.log(`
${colors.bold}${colors.cyan}Excel Data Ingestion Tool${colors.reset}

${colors.bold}USAGE:${colors.reset}
  npm run ingest [options] [filename]

${colors.bold}OPTIONS:${colors.reset}
  --file, -f <filename>    Process specific Excel file
  --force                  Skip confirmation prompts
  --dry-run, --dry         Validate only, no database changes
  --skip-validation        Skip Excel validation (dangerous)
  --stop-on-error          Stop processing on first error
  --help, -h               Show this help message

${colors.bold}EXAMPLES:${colors.reset}
  npm run ingest                           # Process all files in data/excel/
  npm run ingest --file portfolio.xlsx     # Process specific file
  npm run ingest --dry-run                 # Validate all files without changes
  npm run ingest --force                   # Skip confirmation prompts
  npm run ingest portfolio.xlsx --dry-run  # Validate specific file

${colors.bold}DIRECTORIES:${colors.reset}
  data/excel/           - Source directory for Excel files
  data/excel/processed/ - Successfully processed files
  data/excel/error/     - Files that failed processing

${colors.yellow}WARNING: This operation will replace existing portfolio data in the database.${colors.reset}
`)
}

/**
 * Confirm destructive operations with user
 */
async function confirmOperation(options: IngestionOptions): Promise<boolean> {
	if (options.force || options.dryRun) {
		return true
	}

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	})

	return new Promise((resolve) => {
		const message = options.filePath 
			? `Process file '${options.filePath}' and replace existing portfolio data?`
			: `Process all Excel files and replace existing portfolio data?`

		rl.question(`${colors.yellow}${message} (y/N): ${colors.reset}`, (answer) => {
			rl.close()
			resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
		})
	})
}

/**
 * Display ingestion results
 */
function displayResults(result: IngestionResult): void {
	console.log(`\n${colors.bold}=== INGESTION RESULTS ===${colors.reset}`)
	
	// Overall status
	const statusColor = result.success ? colors.green : colors.red
	const statusText = result.success ? 'SUCCESS' : 'FAILED'
	console.log(`${colors.bold}Status: ${statusColor}${statusText}${colors.reset}`)
	
	// Summary
	const { summary } = result
	console.log(`\n${colors.bold}Summary:${colors.reset}`)
	console.log(`  Files processed: ${summary.totalFiles}`)
	console.log(`  ${colors.green}Successful: ${summary.successfulFiles}${colors.reset}`)
	console.log(`  ${colors.red}Failed: ${summary.failedFiles}${colors.reset}`)
	console.log(`  Rows processed: ${summary.totalRowsProcessed}`)
	console.log(`  Total errors: ${summary.totalErrors}`)
	console.log(`  Processing time: ${summary.totalProcessingTimeMs}ms`)
	
	// File details
	if (result.fileResults.length > 0) {
		console.log(`\n${colors.bold}File Details:${colors.reset}`)
		
		for (const fileResult of result.fileResults) {
			const statusColor = fileResult.success ? colors.green : colors.red
			const statusIcon = fileResult.success ? '✓' : '✗'
			
			console.log(`\n  ${statusColor}${statusIcon} ${fileResult.fileName}${colors.reset}`)
			console.log(`    Portfolio ID: ${fileResult.portfolioId || 'N/A'}`)
			console.log(`    Extract Date: ${fileResult.extractDate?.toDateString() || 'N/A'}`)
			console.log(`    Rows processed: ${fileResult.rowsProcessed}`)
			console.log(`    Processing time: ${fileResult.processingTimeMs}ms`)
			
			if (fileResult.movedTo) {
				console.log(`    Moved to: ${fileResult.movedTo}`)
			}
			
			if (fileResult.errors.length > 0) {
				console.log(`    ${colors.red}Errors:${colors.reset}`)
				for (const error of fileResult.errors) {
					console.log(`      - ${error}`)
				}
			}
		}
	}
	
	// Global errors
	if (result.globalErrors.length > 0) {
		console.log(`\n${colors.bold}${colors.red}Global Errors:${colors.reset}`)
		for (const error of result.globalErrors) {
			console.log(`  - ${error}`)
		}
	}
	
	console.log(`\n${colors.cyan}Ingestion completed at ${new Date().toISOString()}${colors.reset}`)
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
	try {
		console.log(`${colors.bold}${colors.cyan}Excel Data Ingestion Tool${colors.reset}`)
		console.log(`Starting at ${new Date().toISOString()}\n`)

		// Parse arguments
		const options = parseArguments()
		
		// Show options
		console.log(`${colors.bold}Configuration:${colors.reset}`)
		console.log(`  File: ${options.filePath || 'All files in data/excel/'}`)
		console.log(`  Dry run: ${options.dryRun ? colors.yellow + 'YES' + colors.reset : 'No'}`)
		console.log(`  Force: ${options.force ? 'Yes' : 'No'}`)
		console.log(`  Continue on error: ${options.continueOnError ? 'Yes' : 'No'}`)
		console.log(`  Skip validation: ${options.skipValidation ? colors.yellow + 'YES (DANGEROUS)' + colors.reset : 'No'}`)
		
		// Confirm operation
		const confirmed = await confirmOperation(options)
		if (!confirmed) {
			console.log(`\n${colors.yellow}Operation cancelled by user${colors.reset}`)
			process.exit(0)
		}
		
		console.log(`\n${colors.bold}Starting ingestion...${colors.reset}`)
		
		// Execute ingestion
		const result = await ingestExcelFiles(options)
		
		// Display results
		displayResults(result)
		
		// Exit with appropriate code
		process.exit(result.success ? 0 : 1)
		
	} catch (error) {
		console.error(`\n${colors.red}${colors.bold}FATAL ERROR:${colors.reset}`)
		console.error(`${colors.red}${error}${colors.reset}`)
		
		if (error instanceof Error && error.stack) {
			console.error(`\n${colors.yellow}Stack trace:${colors.reset}`)
			console.error(error.stack)
		}
		
		process.exit(1)
	}
}

// Run the CLI
main().catch((error) => {
	console.error(`${colors.red}Unhandled error: ${error}${colors.reset}`)
	process.exit(1)
}) 