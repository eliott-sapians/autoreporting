import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

interface Portfolio {
	id: string
	clientName: string
	lastExtractionDate: string
}

async function getPortfolios(): Promise<Portfolio[]> {
	try {
		const response = await fetch('http://localhost:3000/api/portfolios', {
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

export default async function Home() {
	const portfolios = await getPortfolios()

	return (
		<div className="container mx-auto py-8 px-4">
			<h1 className="text-2xl font-bold mb-6">Gestion des Portefeuilles</h1>
			
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID Portfolio</TableHead>
							<TableHead>Nom du Client</TableHead>
							<TableHead>Dernière Date d'Extraction</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{portfolios.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
										<Button variant="outline" size="sm">
											Accéder au suivi
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
