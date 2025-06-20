'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/toast"
import { downloadFileFromResponse } from "@/lib/utils"
import { useState, useEffect } from "react"
import type { Portfolio } from "./api/portfolios/route"

async function getPortfolios(): Promise<Portfolio[]> {
	try {
		// Use absolute URL for server-side fetch
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const response = await fetch(`${baseUrl}/api/portfolios`, {
			cache: 'no-store'
		})
		if (!response.ok) {
			throw new Error('Failed to fetch portfolios')
		}
		return response.json()
	} catch (error) {
		console.error('Error fetching portfolios:', error)
		return []
	}
}

function PortfolioTable({ portfolios }: { portfolios: Portfolio[] }) {
	const { toast } = useToast()
	const [loadingId, setLoadingId] = useState<string | null>(null)

	const handleExportPdf = async (portfolioId: string) => {
		setLoadingId(portfolioId)
		try {
			const response = await fetch(`/api/portfolio/${encodeURIComponent(portfolioId)}/export-pdf`)
			await downloadFileFromResponse(response, `portfolio_${portfolioId}.pdf`)
			toast('PDF exporté avec succès', 'default')
		} catch (error) {
			console.error('Error exporting PDF:', error)
			toast('Échec de l&apos;export PDF', 'destructive')
		} finally {
			setLoadingId(null)
		}
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID Portfolio</TableHead>
						<TableHead>Nom du Client</TableHead>
						<TableHead>Date du dernier extract</TableHead>
						<TableHead className="text-right">Actions</TableHead>
						<TableHead className="text-right">Export PDF</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{portfolios.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
								Aucun portefeuille trouvé
							</TableCell>
						</TableRow>
					) : (
						portfolios.map((portfolio) => (
							<TableRow key={portfolio.id}>
								<TableCell className="font-medium">{portfolio.id}</TableCell>
								<TableCell>{portfolio.clientName}</TableCell>
								<TableCell>{portfolio.lastExtractionDate}</TableCell>
								<TableCell className="text-right">
									<Link href={`/print/portfolio/${encodeURIComponent(portfolio.id)}`}>
										<Button variant="outline" size="sm">
											Accéder au suivi
										</Button>
									</Link>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleExportPdf(portfolio.id)}
										disabled={loadingId === portfolio.id}
										aria-label={`Exporter le PDF du portefeuille ${portfolio.id}`}
										className="w-[120px] justify-center"
									>
										{loadingId === portfolio.id ? (
											<>
												<span className="animate-spin mr-2">S</span>
												Export...
											</>
										) : (
											<span className="justify-center">Exporter PDF</span>
										)}
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	)
}

export default function Home() {
	const [portfolios, setPortfolios] = useState<Portfolio[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		getPortfolios()
			.then(setPortfolios)
			.finally(() => setLoading(false))
	}, [])

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-2xl font-bold mb-6">Gestion des Portefeuilles</h1>
				<div className="text-center py-8">Chargement...</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-6">Gestion des Portefeuilles</h1>
			<PortfolioTable portfolios={portfolios} />
		</div>
	)
}
