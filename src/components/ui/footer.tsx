'use client'

export default function Footer() {
	const currentDate = new Date()
	const currentYear = currentDate.getFullYear()
	const currentMonth = currentDate.getMonth() + 1 // getMonth() returns 0-11
	
	// S1 = January to June (months 1-6), S2 = July to December (months 7-12)
	const semester = currentMonth <= 6 ? 'S1' : 'S2'
	
	return (
		<footer className='w-full flex justify-between items-center px-16 py-4 bg-background'>
			<div className='text-2xl font-semibold font-outfit'>
				sapians
			</div>
			<div className='text-xl font-medium'>
				{semester} {currentYear}
			</div>
		</footer>
	)
} 