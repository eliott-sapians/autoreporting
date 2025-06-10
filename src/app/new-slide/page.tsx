'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePortfolioData } from '@/lib/data/hooks/use-portfolio-data'
import Garde from '@/components/slides/1-garde'
import Synthese from '@/components/slides/2-synthese'
import Zoom from '@/components/slides/3-zoom'
import DetailProvision from '@/components/slides/4-detail-provision'
import DetailLiquid from '@/components/slides/5-detail-liquid'
import DetailIlliquid from '@/components/slides/6-detail-illiquid'
import Methodology from '@/components/slides/8-methodology'

export default function NewSlidePage() {
	const router = useRouter()
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
	
	// Get the first available portfolio ID
	const [portfolioId, setPortfolioId] = useState<string | null>(null)
	
	// Fetch available portfolios and use the first one
	useEffect(() => {
		async function getFirstPortfolio() {
			try {
				const response = await fetch('/api/portfolios')
				if (response.ok) {
					const portfolios = await response.json()
					if (portfolios.length > 0) {
						setPortfolioId(portfolios[0].id)
					} else {
						// No portfolios available, redirect to home
						router.push('/')
					}
				}
			} catch (error) {
				console.error('Failed to fetch portfolios:', error)
				router.push('/')
			}
		}
		getFirstPortfolio()
	}, [router])
	
	// Fetch portfolio data using the hook
	const { loading, error, slide1, slide2, slide3, slide4, slide5, slide6 } = usePortfolioData(portfolioId)

	// Memoized keydown handler for navigation
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') {
			setCurrentSlideIndex((prevIndex) =>
				(prevIndex + 1) % 7 // 6 data slides + 1 methodology slide
			)
		} else if (event.key === 'ArrowLeft') {
			setCurrentSlideIndex((prevIndex) =>
				(prevIndex - 1 + 7) % 7
			)
		}
	}, [])

	// Effect to add and remove the global keydown event listener
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	// Show loading state
	if (loading) {
		return (
			<div className="w-screen h-screen flex items-center justify-center bg-dark text-foreground-dark">
				<div className="text-center">
					<div className="text-xl mb-4">Chargement du portefeuille...</div>
					<div className="text-sm text-muted-foreground">Récupération et transformation des données</div>
				</div>
			</div>
		)
	}

	// Show error state
	if (error) {
		return (
			<div className="w-screen h-screen flex items-center justify-center bg-dark text-foreground-dark">
				<div className="text-center">
					<div className="text-xl mb-4 text-destructive">Erreur de chargement</div>
					<div className="text-sm text-muted-foreground">{error}</div>
				</div>
			</div>
		)
	}

	// Render the appropriate slide component based on current index
	const renderCurrentSlide = () => {
		switch (currentSlideIndex) {
			case 0:
				return <Garde data={slide1} />
			case 1:
				return <Synthese data={slide2} />
			case 2:
				return <Zoom data={slide3} />
			case 3:
				return <DetailProvision data={slide4} />
			case 4:
				return <DetailLiquid data={slide5} />
			case 5:
				return <DetailIlliquid data={slide6} />
			case 6:
				return <Methodology />
			default:
				return <Garde data={slide1} />
		}
	}

	return (
		<div className="relative">
			{renderCurrentSlide()}
			
			{/* Optional: Add slide navigation indicator */}
			<div className="fixed bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
				{currentSlideIndex + 1} / 7
			</div>
		</div>
	)
}
