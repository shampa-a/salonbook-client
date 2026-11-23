import Link from "next/link";

interface SalonBookLogoProps {
  light?: boolean;
  compact?: boolean;
}

export default function SalonBookLogo({
  light = false,
  compact = false,
}: SalonBookLogoProps) {
  return (
    <Link
      href="/"
      aria-label="SalonBook homepage"
      className="inline-flex items-center gap-3"
    >
      <svg
        width="43"
        height="43"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="15"
          fill="#75415F"
        />

        <path
          d="M14 34V21C14 15.477 18.477 11 24 11C29.523 11 34 15.477 34 21V34"
          stroke="#F8E9EF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M19 34V24C19 21.239 21.239 19 24 19C26.761 19 29 21.239 29 24V34"
          stroke="#E6B8C9"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M11 34H37"
          stroke="#F8E9EF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M35 10L36.5 13.5L40 15L36.5 16.5L35 20L33.5 16.5L30 15L33.5 13.5L35 10Z"
          fill="#E6C18B"
        />
      </svg>

      {!compact && (
        <span
          className={`text-[25px] font-bold tracking-tight ${
            light ? "text-white" : "text-[#35232F]"
          }`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          Salon<span className="text-[#A76583]">Book</span>
        </span>
      )}
    </Link>
  );
}