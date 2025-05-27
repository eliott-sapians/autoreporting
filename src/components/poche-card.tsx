'use client'

interface PocheCardProps {
    name: string
    amount: string
    amountRatio?: string
    performanceLabel: string
    performanceValue: string
    mainBgClass: string
    amountBgClass: string
    performanceTextClass: string
    performanceBgClass: string
    mainTextColorClass?: string
}

export default function PocheCard({
    name,
    amount,
    amountRatio,
    performanceLabel,
    performanceValue,
    mainBgClass,
    amountBgClass,
    performanceTextClass,
    performanceBgClass,
    mainTextColorClass = '',
}: PocheCardProps) {
    return (
        <div className='grid grid-cols-4'>
            <div className={`col-span-3 grid grid-cols-4 grid-rows-4 ${mainBgClass} ${mainTextColorClass}`}>        
                <div className='col-span-4 row-span-2 flex items-center pl-4'>
                    <p className='text-lg font-bold'>{name}</p>
                </div>
                <div className={`col-span-3 row-span-2 grid grid-cols-2 ${amountBgClass} flex items-center pl-4`}>
                    <p>{amount}</p>
                    {amountRatio && <p className='flex justify-end pr-4'>{amountRatio}</p>}
                </div>
            </div>
            <div className='col-span-1 grid grid-rows-4'>
                <div className={`row-span-1 flex items-center justify-center ${performanceTextClass}`}>
                    <p className='text-sm'>{performanceLabel}</p>
                </div>
                <div className={`row-span-3 flex items-center justify-center ${performanceBgClass}`}>
                    <p className='text-lg'>{performanceValue}</p>
                </div>
            </div>
        </div>
        
    )
} 