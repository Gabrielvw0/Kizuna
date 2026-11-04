import React from 'react';

interface HankoStampProps {
  kanji: string;
  dateStr?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  roleLabel?: string;
}

export const HankoStamp: React.FC<HankoStampProps> = ({
  kanji,
  dateStr = '26.10.21',
  size = 'md',
  animated = false,
  roleLabel,
}) => {
  const dimensions = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-sm',
  }[size];

  return (
    <div className="inline-flex flex-col items-center select-none">
      {roleLabel && (
        <span className="text-[10px] text-slate-500 font-medium mb-1 tracking-wider">
          {roleLabel}
        </span>
      )}
      <div
        className={`${dimensions} ${
          animated ? 'hanko-animate' : ''
        } rounded-full border-2 border-[#C82829] text-[#C82829] flex flex-col items-center justify-center font-serif font-bold leading-none shadow-sm bg-red-50/30 relative`}
        style={{ transform: 'rotate(-6deg)' }}
        title={`電子印鑑: ${kanji} (${dateStr})`}
      >
        {size !== 'sm' ? (
          <>
            <span className="text-[9px] tracking-tighter pb-[1px] border-b border-[#C82829]/70 w-[84%] text-center">
              {kanji}
            </span>
            <span className="text-[7px] font-mono tracking-tighter py-[1px] border-b border-[#C82829]/70 w-[90%] text-center">
              {dateStr}
            </span>
            <span className="text-[8px] pt-[1px] tracking-widest">承認</span>
          </>
        ) : (
          <span className="text-[11px] tracking-tighter">{kanji}</span>
        )}
      </div>
    </div>
  );
};
