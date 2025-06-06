'use client'

import { useState, useEffect, useCallback } from 'react'
import Garde from '@/components/slides/1-garde'
import Synthese from '@/components/slides/2-synthese' // Assuming Synthese is the other component
import Zoom from '@/components/slides/3-zoom'
import DetailProvision from '@/components/slides/4-detail-provision'
import DetailLiquid from '@/components/slides/5-detail-liquid'
import DetailIlliquid from '@/components/slides/6-detail-illiquid'
import Methodology from '@/components/slides/8-methodology'
// Define the sequence of slide components
const slideComponents = [
	Garde,
	Synthese,
	Zoom,
	DetailProvision,
	DetailLiquid,
	DetailIlliquid,
	Methodology,
	// Add more slide components here in the desired order
]

export default function NewSlidePage() {
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

	// Memoized keydown handler for navigation
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') {
			setCurrentSlideIndex((prevIndex) =>
				(prevIndex + 1) % slideComponents.length
			)
		} else if (event.key === 'ArrowLeft') {
			setCurrentSlideIndex((prevIndex) =>
				(prevIndex - 1 + slideComponents.length) % slideComponents.length
			)
		}
	}, []) // slideComponents.length is constant, so empty dependency array is fine

	// Effect to add and remove the global keydown event listener
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		// Cleanup function to remove the event listener
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown]) // Re-run effect if handleKeyDown (the callback itself) changes

	// Get the component for the current slide
	const CurrentSlideComponent = slideComponents[currentSlideIndex]

	// Render the current slide component
	return <CurrentSlideComponent />
}
