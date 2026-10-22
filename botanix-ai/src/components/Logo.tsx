export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#1f3d2b" />
      <path d="M20 31c0-9 3.5-15.5 11-19-1.2 9.4-5.6 15.8-11 19Z" fill="#9bb595" />
      <path d="M20 31c0-7-2.6-12.2-9-15 .8 7.6 4.1 12.6 9 15Z" fill="#d9e5d4" />
      <path d="M20 33V20" stroke="#fbf9f4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
