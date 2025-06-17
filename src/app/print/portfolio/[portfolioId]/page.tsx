import { notFound } from 'next/navigation'
import Garde from '@/components/slides/1-garde'
import Synthese from '@/components/slides/2-synthese'
import Zoom from '@/components/slides/3-zoom'
import DetailProvision from '@/components/slides/4-detail-provision'
import DetailLiquid from '@/components/slides/5-detail-liquid'
import DetailIlliquid from '@/components/slides/6-detail-illiquid'
import Methodology from '@/components/slides/8-methodology'
import { portfolioService } from '@/lib/data/portfolio-service'
import { 
	transformToGardeData, 
	transformToSyntheseData, 
	transformToZoomData, 
	transformToCTBucketData, 
	transformToLTLBucketData, 
	transformToLTIBucketData 
} from '@/lib/data/transformers'
import PrintReadyScript from './print-ready-script'

interface PrintPortfolioPageProps {
	params: {
		portfolioId: string
	}
}

async function getPortfolioDataForPrint(portfolioId: string) {
	try {
		const rawData = await portfolioService.getRawPortfolioDataByBusinessId(portfolioId)
		if (!rawData) {
			return null
		}

		// Wrap in API response format expected by transformers
		const apiResponse = {
			success: true,
			data: {
				...rawData,
				metadata: {
					timestamp: new Date().toISOString(),
					fundCount: rawData.funds.length,
					extractDate: rawData.portfolio.extractDate
				}
			}
		}

		// Transform data for each slide
		const slide1 = transformToGardeData(apiResponse)
		const slide2 = transformToSyntheseData(apiResponse)
		const slide3 = transformToZoomData(apiResponse)
		const slide4 = transformToCTBucketData(apiResponse)
		const slide5 = transformToLTLBucketData(apiResponse)
		const slide6 = transformToLTIBucketData(apiResponse)

		return {
			slide1,
			slide2,
			slide3,
			slide4,
			slide5,
			slide6
		}
	} catch (error) {
		console.error('Error fetching portfolio data for print:', error)
		return null
	}
}

export default async function PrintPortfolioPage({ params }: PrintPortfolioPageProps) {
	const { portfolioId: rawPortfolioId } = await params
	const portfolioId = decodeURIComponent(rawPortfolioId)
	
	const slideData = await getPortfolioDataForPrint(portfolioId)
	
	if (!slideData) {
		notFound()
	}

	const { slide1, slide2, slide3, slide4, slide5, slide6 } = slideData

	return (
		<div className="print-container">
			{/* Slide 1: Garde */}
			<section className="pdf-page">
				<div className="pdf-root">
					<Garde data={slide1} />
				</div>
			</section>

			{/* Slide 2: Synthese */}
			<section className="pdf-page">
				<div className="pdf-root">
					<Synthese data={slide2} />
				</div>
			</section>

			{/* Slide 3: Zoom */}
			<section className="pdf-page">
				<div className="pdf-root">
					<Zoom data={slide3} />
				</div>
			</section>

			{/* Slide 4: Detail Provision */}
			<section className="pdf-page">
				<div className="pdf-root">
					<DetailProvision data={slide4} />
				</div>
			</section>

			{/* Slide 5: Detail Liquid */}
			<section className="pdf-page">
				<div className="pdf-root">
					<DetailLiquid data={slide5} />
				</div>
			</section>

			{/* Slide 6: Detail Illiquid */}
			<section className="pdf-page">
				<div className="pdf-root">
					<DetailIlliquid data={slide6} />
				</div>
			</section>

			{/* Slide 7: Methodology */}
			<section className="pdf-page">
				<div className="pdf-root">
					<Methodology />
				</div>
			</section>

			{/* Client-side script to add pdf-ready class */}
			<PrintReadyScript />
		</div>
	)
} 