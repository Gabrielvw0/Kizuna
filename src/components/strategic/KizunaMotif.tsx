import React from 'react';

interface KizunaMotifProps {
  /**
   * 'apart' = Two separate visual streams (Globant Blue & Japan Crimson)
   * 'crossing' = Streams intersecting in tension
   * 'connected' = Interlocked Kizuna nexus (●────●)
   */
  state?: 'apart' | 'crossing' | 'connected';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * KIZUNA MOTIF (絆)
 * Recurring graphic signature: two visual flows (Globant Sky Blue + Japan Crimson)
 * that cross and remain connected in an architectural Kumiko nexus.
 */
export const KizunaMotif: React.FC<KizunaMotifProps> = ({
  state = 'connected',
  size = 'md',
  className = ''
}) => {
  const dimensions =
    size === 'sm' ? 'w-20 h-6' : size === 'lg' ? 'w-56 h-14' : 'w-36 h-9';

  return (
    <svg
      viewBox="0 0 180 44"
      className={`${dimensions} select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="motifGlobant" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0.85)" />
        </linearGradient>
        <linearGradient id="motifJapan" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(225, 29, 72, 0.1)" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="rgba(225, 29, 72, 0.85)" />
        </linearGradient>
      </defs>

      {/* Subtle Kumiko Diagonal Wings: ╲ ╱ ●──● ╱ ╲ */}
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1" fill="none">
        <path d="M 48 6 L 68 22 L 48 38" />
        <path d="M 132 6 L 112 22 L 132 38" />
      </g>

      {state === 'apart' && (
        <>
          {/* Globant Left Stream */}
          <path
            d="M 6 14 C 32 14, 48 14, 72 14"
            fill="none"
            stroke="url(#motifGlobant)"
            strokeWidth="2"
          />
          <circle cx="72" cy="14" r="3" fill="#38BDF8" />

          {/* Japan Right Stream */}
          <path
            d="M 174 30 C 148 30, 132 30, 108 30"
            fill="none"
            stroke="url(#motifJapan)"
            strokeWidth="2"
          />
          <circle cx="108" cy="30" r="3" fill="#E11D48" />
        </>
      )}

      {state === 'crossing' && (
        <>
          <path
            d="M 6 34 C 50 34, 70 10, 118 10"
            fill="none"
            stroke="url(#motifGlobant)"
            strokeWidth="2"
          />
          <path
            d="M 174 34 C 130 34, 110 10, 62 10"
            fill="none"
            stroke="url(#motifJapan)"
            strokeWidth="2"
          />
          <circle cx="90" cy="22" r="3.5" fill="#F8FAFC" />
        </>
      )}

      {state === 'connected' && (
        <>
          {/* Globant Flow entering from left, interlocking at center */}
          <path
            d="M 4 8 L 42 8 L 68 22 L 42 36 L 16 36"
            fill="none"
            stroke="url(#motifGlobant)"
            strokeWidth="1.75"
          />
          {/* Japan Flow entering from right, interlocking at center */}
          <path
            d="M 176 8 L 138 8 L 112 22 L 138 36 L 164 36"
            fill="none"
            stroke="url(#motifJapan)"
            strokeWidth="1.75"
          />

          {/* Central Kizuna Bond: ●────● */}
          <line
            x1="68"
            y1="22"
            x2="112"
            y2="22"
            stroke="#F8FAFC"
            strokeWidth="2"
          />
          <circle cx="68" cy="22" r="3.5" fill="#38BDF8" />
          <circle cx="90" cy="22" r="4" fill="#E11D48" />
          <circle cx="112" cy="22" r="3.5" fill="#E11D48" />
        </>
      )}
    </svg>
  );
};
