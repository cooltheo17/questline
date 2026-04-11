function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function createIconSvg(path: string, fill: string, stroke = 'none'): string {
  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  )
}

export function createSceneSvg({
  background,
  foreground,
  accent,
}: {
  background: string
  foreground: string
  accent: string
}): string {
  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="480" height="320" rx="36" fill="url(#sky)" />
      <path d="M60 240c50-70 132-70 182 0H60Z" fill="${foreground}" opacity="0.86" />
      <path d="M210 240c40-102 98-128 150-142 24 58 27 107 4 142H210Z" fill="${accent}" opacity="0.9" />
      <path d="M272 205 314 118l37 87h-79Z" fill="${foreground}" />
      <circle cx="362" cy="74" r="18" fill="${foreground}" opacity="0.9" />
    </svg>`,
  )
}

export function createThemedSvgAsset(svg: string, replacements: Record<string, string>): string {
  let themedSvg = svg

  for (const [from, to] of Object.entries(replacements)) {
    themedSvg = themedSvg.split(from).join(to)
  }

  return encodeSvg(themedSvg)
}
