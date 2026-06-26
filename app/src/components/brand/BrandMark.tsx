import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
}

/**
 * Marca "F" da Forte Contabilidade — topo prateado + haste dourada,
 * em harmonia com o favicon.
 */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-8', className)}
      role="img"
      aria-label="Forte Contabilidade"
    >
      <defs>
        <linearGradient id="brand-silver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfbfbf" />
          <stop offset=".5" stopColor="#f4f4f4" />
          <stop offset="1" stopColor="#a8a8a8" />
        </linearGradient>
        <linearGradient id="brand-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d65a" />
          <stop offset=".55" stopColor="#e3a70a" />
          <stop offset="1" stopColor="#bf8500" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0f172a" />
      <polygon points="17,13 51,13 47,21 13,21" fill="url(#brand-silver)" />
      <path d="M18 26 H50 L46 33 H28 V40 H44 L40 47 H28 V50 L23 57 L18 50 Z" fill="url(#brand-gold)" />
    </svg>
  );
}
