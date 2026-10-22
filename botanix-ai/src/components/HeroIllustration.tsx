// Ilustración botánica propia (SVG). Decorativa: no representa ningún resultado ni jardín real.
export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[var(--color-sage-200)] via-[var(--color-cream-200)] to-[var(--color-sage-100)]" />
      <svg viewBox="0 0 400 400" className="relative h-full w-full">
        <circle cx="300" cy="90" r="38" fill="#f3d27a" opacity=".75" />
        <path d="M60 330c60-18 220-18 280 0v40H60z" fill="#8a6e45" opacity=".25" />
        <g stroke="#1f3d2b" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M200 340V150" />
          <path d="M200 260c-30-10-55-38-60-80 35 8 58 34 60 80Z" fill="#7f9c7a" />
          <path d="M200 230c30-12 58-44 66-92-40 10-64 40-66 92Z" fill="#376a49" />
          <path d="M200 190c-22-12-38-36-38-68 26 10 40 32 38 68Z" fill="#9bb595" />
          <path d="M200 150c-6-24 2-46 22-62 6 26-2 46-22 62Z" fill="#bccfb6" />
        </g>
        <g fill="#c0703f">
          <circle cx="118" cy="300" r="7" /><circle cx="292" cy="296" r="6" /><circle cx="270" cy="318" r="5" />
        </g>
        <g transform="translate(250 200)">
          <rect width="110" height="70" rx="14" fill="#fbf9f4" stroke="#d9e5d4" />
          <text x="14" y="28" fontSize="13" fontFamily="Georgia, serif" fill="#1f3d2b" fontStyle="italic">Lavandula</text>
          <rect x="14" y="40" width="70" height="6" rx="3" fill="#d9e5d4" />
          <rect x="14" y="40" width="52" height="6" rx="3" fill="#376a49" />
        </g>
        <g transform="translate(36 120)">
          <rect width="104" height="56" rx="14" fill="#fbf9f4" stroke="#d9e5d4" />
          <text x="14" y="24" fontSize="11" fontFamily="system-ui" fill="#55665b">Siembra</text>
          <text x="14" y="42" fontSize="14" fontFamily="Georgia, serif" fill="#1f3d2b">Óptimo</text>
        </g>
      </svg>
    </div>
  );
}
