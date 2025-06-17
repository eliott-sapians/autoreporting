'use client'

import { useEffect } from 'react'

export default function PrintReadyScript() {
	useEffect(() => {
		// Add pdf-ready class to body to signal to Playwright that rendering is complete
		document.body.classList.add('pdf-ready')
		
		return () => {
			document.body.classList.remove('pdf-ready')
		}
	}, [])

	return null
} 