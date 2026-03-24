interface LeRoxLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Force a specific colour for "Le Rox" regardless of dark-mode */
  textColor?: string;
  /** Additional className on the wrapper */
  className?: string;
}

const sizeMap = {
  sm: { main: "text-xl",  sub: "text-[9px]" },
  md: { main: "text-2xl", sub: "text-[11px]" },
  lg: { main: "text-4xl", sub: "text-[13px]" },
};

export function LeRoxLogo({ size = "md", textColor, className = "" }: LeRoxLogoProps) {
  const { main, sub } = sizeMap[size];
  const font = "var(--font-garamond), 'Book Antiqua', Palatino, Georgia, serif";

  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      <span
        className={`${main} font-bold tracking-tight ${textColor ?? "text-gray-900 dark:text-white"}`}
        style={{ fontFamily: font }}
      >
        Le Rox
      </span>
      <span
        className={`${sub} font-medium tracking-widest uppercase text-[#c07a6a] dark:text-[#e09a8a]`}
        style={{ fontFamily: font }}
      >
        Home Stay
      </span>
    </div>
  );
}
