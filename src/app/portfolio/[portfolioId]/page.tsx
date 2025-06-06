'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePortfolioData } from '@/lib/data/hooks/use-portfolio-data'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import Garde from '@/components/slides/1-garde'
import Synthese from '@/components/slides/2-synthese'
import Zoom from '@/components/slides/3-zoom'
import DetailProvision from '@/components/slides/4-detail-provision'
import DetailLiquid from '@/components/slides/5-detail-liquid'
import DetailIlliquid from '@/components/slides/6-detail-illiquid'
import Methodology from '@/components/slides/8-methodology'

interface PortfolioPageProps {
	params: {
		portfolioId: string
	}
}

export default function PortfolioPage({ params }: PortfolioPageProps) {
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
	const portfolioId = decodeURIComponent(params.portfolioId)
	
	// Fetch portfolio data using the hook with dynamic portfolio ID
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
					<div className="text-sm text-muted-foreground">
						Portfolio ID: {portfolioId}
					</div>
					<div className="text-sm text-muted-foreground">Récupération et transformation des données</div>
				</div>
			</div>
		)
	}

	// Show error state
	if (error) {
		return (
			<div className="w-screen h-screen flex items-center justify-center bg-dark text-foreground-dark">
				<div className="text-center max-w-md">
					<div className="text-xl mb-4 text-destructive">Erreur de chargement</div>
					<div className="text-sm text-muted-foreground mb-6">
						Portfolio ID: {portfolioId}
					</div>
					<div className="text-sm text-muted-foreground mb-6">{error}</div>
					<Link href="/">
						<Button variant="outline" className="mr-2">
							<Home className="w-4 h-4 mr-2" />
							Retour à la liste
						</Button>
					</Link>
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
			
			{/* Navigation controls */}
			<div className="fixed top-4 left-4 z-50">
				<Link href="/">
					<Button variant="outline" size="sm" className="bg-black/50 text-white border-white/20 hover:bg-black/70">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Liste des portefeuilles
					</Button>
				</Link>
			</div>
			
			{/* Slide navigation indicator */}
			<div className="fixed bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
				{currentSlideIndex + 1} / 7
			</div>
			
			{/* Portfolio ID indicator (optional, for debugging) */}
			<div className="fixed bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs opacity-70">
				Portfolio: {portfolioId}
			</div>
		</div>
	)
} 