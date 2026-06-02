type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  lightText?: boolean;
  iconTile?: boolean;
};

export default function BrandLogo({ className = '', compact = false, lightText = false, iconTile = false }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={iconTile ? 'rounded-lg bg-white p-1 shadow-sm' : ''}>
        <img src="/unistaylogo-transparent.png" alt="UniStay+" className="h-12 w-12 shrink-0 object-contain" />
      </span>
      {!compact && <span className={`text-xl font-black tracking-tight ${lightText ? 'text-white' : 'text-slate-950 dark:text-white'}`}>UniStay<span className="text-[#0872c9]">+</span></span>}
    </span>
  );
}
