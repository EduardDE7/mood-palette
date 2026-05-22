"use client";

export const BrandLogo = () => {
  return (
    <div className="group inline-flex items-center gap-2">
      <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Palettrix"
        fill="none"
        className="palettrix-logo -translate-y-px h-8 w-8 shrink-0 sm:h-9 sm:w-9"
      >
        <defs>
          <linearGradient
            id="palettrix-mark-gradient"
            x1="94"
            y1="46"
            x2="177"
            y2="201"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              className="palettrix-stop palettrix-stop--mark-start"
              offset="0%"
              stopColor="#FF7A1A"
            />
            <stop
              className="palettrix-stop palettrix-stop--mark-mid"
              offset="48%"
              stopColor="#FF5C5F"
            />
            <stop
              className="palettrix-stop palettrix-stop--mark-end"
              offset="100%"
              stopColor="#F0448D"
            />
          </linearGradient>
          <linearGradient
            id="palettrix-dot-gradient-1"
            x1="45"
            y1="68"
            x2="75"
            y2="98"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              className="palettrix-stop palettrix-stop--dot-one-start"
              offset="0%"
              stopColor="#FF8A1F"
            />
            <stop
              className="palettrix-stop palettrix-stop--dot-one-end"
              offset="100%"
              stopColor="#FF5B1F"
            />
          </linearGradient>
          <linearGradient
            id="palettrix-dot-gradient-2"
            x1="45"
            y1="113"
            x2="75"
            y2="143"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              className="palettrix-stop palettrix-stop--dot-two-start"
              offset="0%"
              stopColor="#FF7662"
            />
            <stop
              className="palettrix-stop palettrix-stop--dot-two-end"
              offset="100%"
              stopColor="#FF4F68"
            />
          </linearGradient>
          <linearGradient
            id="palettrix-dot-gradient-3"
            x1="45"
            y1="158"
            x2="75"
            y2="188"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              className="palettrix-stop palettrix-stop--dot-three-start"
              offset="0%"
              stopColor="#FF5E7B"
            />
            <stop
              className="palettrix-stop palettrix-stop--dot-three-end"
              offset="100%"
              stopColor="#F04286"
            />
          </linearGradient>
        </defs>

        <g className="palettrix-logo__mark">
          <path
            d="M103 66 H151 C185 66 207 91 207 124 C207 157 184 181 151 181 H135 C124 181 116 189 116 200 V214"
            fill="none"
            stroke="url(#palettrix-mark-gradient)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="22"
          />

          <circle cx="61" cy="82" r="15" fill="url(#palettrix-dot-gradient-1)" />
          <circle cx="61" cy="127" r="15" fill="url(#palettrix-dot-gradient-2)" />
          <circle cx="61" cy="172" r="15" fill="url(#palettrix-dot-gradient-3)" />
        </g>
      </svg>

      <h1 className="text-foreground text-xl font-bold tracking-tight drop-shadow-sm">
        Palettrix
      </h1>
    </div>
  );
};
