import React from 'react';

/** Cabeçalho enxuto e comum às telas: uma linha de contexto e um título. */
export const ScreenTitle: React.FC<{
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  align?: 'left' | 'center';
}> = ({ kicker, title, aside, align = 'left' }) => (
  <div
    className={`relative z-10 flex flex-col gap-3 ${
      align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
    }`}
  >
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-rose-400">{kicker}</div>
      <h1 className="mt-1 text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">{title}</h1>
    </div>
    {aside}
  </div>
);

/** Selo de classificação da informação (mesma taxonomia do painel de evidências). */
export const InfoTag: React.FC<{ kind: 'fato' | 'externo' | 'proposta' | 'hipotese' | 'projecao' | 'demo' | 'preco'; children?: React.ReactNode }> = ({
  kind,
  children
}) => {
  const map = {
    fato: ['FATO INSTITUCIONAL', 'bg-sky-500/15 border-sky-400/40 text-sky-200'],
    externo: ['DADO EXTERNO COM FONTE', 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'],
    proposta: ['PROPOSTA DO PROJETO', 'bg-purple-500/15 border-purple-400/40 text-purple-200'],
    hipotese: ['HIPÓTESE', 'bg-amber-500/15 border-amber-400/40 text-amber-200'],
    projecao: ['PROJEÇÃO', 'bg-orange-500/15 border-orange-400/40 text-orange-200'],
    demo: ['DADO DE DEMONSTRAÇÃO', 'bg-slate-500/20 border-slate-400/40 text-slate-200'],
    preco: ['PREÇO SUGERIDO', 'bg-rose-500/15 border-rose-400/40 text-rose-200']
  } as const;
  const [label, cls] = map[kind];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold tracking-wider ${cls}`}>
      {children ?? label}
    </span>
  );
};
