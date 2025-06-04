'use client'

import { useState, useEffect } from 'react'
import { 
	Table, 
	TableHeader, 
	TableRow, 
	TableHead, 
	TableBody, 
	TableCell, 
	TableFooter 
} from '@/components/ui/table'
import type { FundData, TotalData } from '@/lib/types'
import { getProvisionData } from '@/lib/data/provision-service'

export default function TableDetail() {
	const [fundData, setFundData] = useState<FundData[]>([])
	const [totalData, setTotalData] = useState<TotalData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function loadData() {
			try {
				const data = await getProvisionData()
				setFundData(data.funds)
				setTotalData(data.total)
			} catch (error) {
				console.error('Error loading provision data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadData()
	}, [])

	if (isLoading) {
		return (
			<div className="w-full border border-border bg-card shadow-md overflow-hidden">
				<div className="p-6 text-center text-muted-foreground">
					Chargement des données...
				</div>
			</div>
		)
	}

	if (!totalData) {
		return (
			<div className="w-full border border-border bg-card shadow-md overflow-hidden">
				<div className="p-6 text-center text-destructive">
					Erreur lors du chargement des données
				</div>
			</div>
		)
	}

	return (
		<div className="w-full border border-border bg-card shadow-md overflow-hidden">
			<Table>
                <TableHeader className="bg-dark text-base">
                    <TableRow className="border-b border-border hover:bg-transparent h-24">
                        <TableHead className="font-semibold text-foreground-dark px-6 py-6 text-left">
                            LIBELLÉ DU FONDS
                        </TableHead>
                        <TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
                            STRATÉGIE
                        </TableHead>
                        <TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
                            VALORISATION
                        </TableHead>
                        <TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
                            PERFORMANCE (%)
                        </TableHead>
                        <TableHead className="font-semibold text-foreground-dark px-6 py-6 text-center">
                            PERFORMANCE (EUR)
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className='text-base'>
                    {fundData.map((fund, index) => (
                        <TableRow 
                            key={fund.name}
                            className={`
                                border-b border-border transition-colors hover:bg-[var(--color-grey-sapians-300)]/50
                                ${index % 2 === 0 ? 'bg-[var(--color-grey-sapians-100)]' : 'bg-[var(--color-grey-sapians-200)]'}
                            `}
                        >
                            <TableCell className="px-6 py-6 font-medium text-card-foreground">
                                {fund.name}
                            </TableCell>
                            <TableCell className="px-6 py-6 text-center text-muted-foreground">
                                {fund.strategy}
                            </TableCell>
                            <TableCell className="px-6 py-6 text-center font-medium text-card-foreground">
                                {fund.valuation}
                            </TableCell>
                            <TableCell className="px-6 py-6 text-center">
                                <span className={`
                                    font-medium 
                                    ${
	                                    parseFloat(fund.performance.replace(',', '.')) < 0
		                                    ? 'text-[var(--color-orange-sapians-500)]'
		                                    : fund.performance === '0,0%'
			                                    ? 'text-muted-foreground'
			                                    : 'text-[var(--color-green-sapians-500)]'
                                    }
                                `}>
                                    {fund.performance}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-6 text-center">
                                <span className={`
                                    font-medium 
                                    ${
                                        parseFloat(fund.performanceEur.replace(',', '.')) < 0
                                            ? 'text-[var(--color-orange-sapians-500)]'
                                            : fund.performanceEur === '- €'
                                                ? 'text-muted-foreground'
                                                : 'text-[var(--color-green-sapians-500)]'
                                    }
                                `}>
                                    {fund.performanceEur}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-[var(--color-gray-sapians-700)] h-24 border-t-2 border-[var(--color-grey-sapians-300)] hover:bg-[var(--color-grey-sapians-300)]/50 px-6 py-6">
                        <TableCell className="px-6 py-6 font-bold text-card-foreground text-lg">
                            Total
                        </TableCell>
                        <TableCell className="px-6 py-6"></TableCell>
                        <TableCell className="text-center font-bold text-card-foreground text-lg">
                            {totalData.total}
                        </TableCell>
                        <TableCell className=" text-center">
                            <span className={`
                                font-bold text-lg
                                ${
                                    parseFloat(totalData.performance.replace(',', '.')) < 0
                                        ? 'text-[var(--color-orange-sapians-500)]'
                                        : totalData.performance === '0,0%'
                                            ? 'text-muted-foreground'
                                            : 'text-[var(--color-green-sapians-500)]'
                                }
                            `}>
                                {totalData.performance}
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                            <span className={`
                                font-bold text-lg
                                ${
                                    parseFloat(totalData.performanceEur.replace(',', '.')) < 0
                                        ? 'text-[var(--color-orange-sapians-500)]'
                                        : totalData.performanceEur === '- €'
                                            ? 'text-muted-foreground'
                                            : 'text-[var(--color-green-sapians-500)]'
                                }
                            `}>
                                {totalData.performanceEur}
                            </span>
                        </TableCell>
                    </TableRow>
                </TableFooter>
			</Table>
		</div>
	)
}
