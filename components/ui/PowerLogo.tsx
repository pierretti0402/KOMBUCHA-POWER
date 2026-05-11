import React from 'react'

interface PowerLogoProps {
  /** 'sm' for navbar, 'lg' for hero */
  size?: 'sm' | 'lg'
  /** Override the circle colour (default: light blue #B3E5FC) */
  circleColor?: string
}

export default function PowerLogo({
  size = 'sm',
  circleColor = '#B3E5FC',
}: PowerLogoProps) {
  const isLg = size === 'lg'

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full shadow-md select-none ${
        isLg ? 'w-48 h-48' : 'w-12 h-12'
      }`}
      style={{ backgroundColor: circleColor }}
    >
      <span
        className={`text-[#FF6B9D] font-black leading-none ${isLg ? 'text-5xl' : 'text-[13px]'}`}
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        power
      </span>
      <span
        className={`text-[#FF6B9D] font-black leading-none tracking-widest ${isLg ? 'text-base' : 'text-[5px]'}`}
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        KOMBUCHA
      </span>
    </div>
  )
}
