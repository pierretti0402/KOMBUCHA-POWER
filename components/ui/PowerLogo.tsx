import React from 'react'

interface PowerLogoProps {
  /** 'sm' for navbar, 'lg' for hero */
  size?: 'sm' | 'lg'
  /** Override the circle colour (default: light blue #B3E5FC) */
  circleColor?: string
}

/**
 * Power Kombucha brand logo.
 * Light blue/mint circular badge with "power" in pink Fredoka One,
 * "KOMBUCHA" in pink bold caps underneath.
 */
export default function PowerLogo({
  size = 'sm',
  circleColor = '#B3E5FC',
}: PowerLogoProps) {
  const isLg = size === 'lg'

  return (
    <div className={`flex flex-col items-center select-none ${isLg ? 'gap-2' : 'gap-0.5'}`}>
      {/* Circular badge */}
      <div
        className={`flex items-center justify-center rounded-full shadow-md ${
          isLg ? 'w-36 h-36' : 'w-10 h-10'
        }`}
        style={{ backgroundColor: circleColor }}
      >
        <span
          className={`text-[#FF6B9D] font-black leading-none ${isLg ? 'text-5xl' : 'text-base'}`}
        >
          power
        </span>
      </div>

      {/* KOMBUCHA label */}
      <span
        className={`text-[#FF6B9D] font-black tracking-widest leading-none ${
          isLg ? 'text-2xl' : 'text-[9px]'
        }`}
      >
        KOMBUCHA
      </span>
    </div>
  )
}
