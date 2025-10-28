import Image from 'next/image'

interface FurfieldLogoProps {
    className?: string
    size?: number
}

export function FurfieldLogo({ className, size = 52 }: FurfieldLogoProps) {
    const classes = ['shrink-0', 'object-contain', className].filter(Boolean).join(' ')

    return (
        <Image
            src="/Furfield-icon small.png"
            alt="FURFIELD paw logo"
            width={size}
            height={size}
            className={classes}
            style={{ width: 'auto', height: 'auto' }}
            priority
        />
    )
}