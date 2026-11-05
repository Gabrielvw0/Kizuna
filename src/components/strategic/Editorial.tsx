import React from 'react';

/**
 * Etapa 8 • Sistema editorial da apresentação.
 * Preto profundo e grafite, branco para leitura, vermelho japonês como assinatura,
 * dourado e azul só como apoio. Sem elementos decorativos sem função.
 *
 * Famílias de composição:
 *  A • cinematográfica — pouco texto, um elemento dominante;
 *  B • narrativa — assimétrica, hierarquia clara;
 *  C • evidência — números e dados grandes e legíveis.
 */

/** Linha de contexto: número da tela e rótulo. */
export const Kicker: React.FC<{ code: string; label: string; jp?: string; className?: string }> = ({
  code,
  label,
  jp,
  className = ''
}) => (
  <div className={`flex items-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.24em] text-washi-muted ${className}`}>
    <span className="font-semibold text-beni-soft tabular-nums">{code}</span>
    <span aria-hidden className="text-washi-dim">/</span>
    <span>{label}</span>
    {jp && <span className="font-display normal-case tracking-normal text-washi-dim">{jp}</span>}
  </div>
);

/** Título editorial em serifa; `accent` aparece em vermelho japonês. */
export const DisplayTitle: React.FC<{
  children: React.ReactNode;
  size?: 'xl' | 'lg' | 'md';
  className?: string;
  as?: 'h1' | 'h2';
}> = ({ children, size = 'lg', className = '', as: Tag = 'h1' }) => {
  const sizes = {
    xl: 'text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl short:text-5xl',
    lg: 'text-[2rem] sm:text-4xl md:text-[2.75rem] lg:text-[3.5rem] short:text-[2.15rem]',
    md: 'text-2xl sm:text-3xl md:text-4xl short:text-[1.75rem]'
  } as const;
  return (
    // !leading: os tamanhos responsivos (sm:text-4xl…) trariam a própria entrelinha e sobreporiam as linhas.
    <Tag className={`font-display font-semibold text-washi !leading-[1.12] tracking-[-0.01em] ${sizes[size]} ${className}`}>
      {children}
    </Tag>
  );
};

export const Accent: React.FC<{ children: React.ReactNode; tone?: 'beni' | 'kin' }> = ({ children, tone = 'beni' }) => (
  <span className={tone === 'beni' ? 'text-beni-soft' : 'text-kin-soft'}>{children}</span>
);

/** Selo de classificação no estilo editorial (mesma taxonomia do painel de evidências). */
export const Classification: React.FC<{
  kind: 'fato' | 'externo' | 'proposta' | 'hipotese' | 'projecao' | 'demo' | 'preco';
  children?: React.ReactNode;
  /** ajuste opcional de tamanho (padrão: o selo pequeno de sempre) */
  className?: string;
}> = ({ kind, children, className = '' }) => {
  const map = {
    fato: ['Fato institucional', 'text-ai-soft border-ai/50'],
    externo: ['Dado externo com fonte', 'text-emerald-300 border-emerald-400/40'],
    proposta: ['Proposta do projeto', 'text-washi-muted border-washi/25'],
    hipotese: ['Hipótese', 'text-kin-soft border-kin/50'],
    projecao: ['Projeção', 'text-kin-soft border-kin/50'],
    demo: ['Dado de demonstração', 'text-washi-muted border-washi/25'],
    preco: ['Preço sugerido', 'text-beni-soft border-beni/50']
  } as const;
  const [label, cls] = map[kind];
  return (
    <span className={`inline-block px-2 py-0.5 border text-[10px] md:text-[11px] font-medium uppercase tracking-[0.14em] ${cls} ${className}`}>
      {children ?? label}
    </span>
  );
};

/**
 * Véu de legibilidade: escurece só a área do texto para que o 3D continue visível
 * sem atravessar a leitura (profundidade controlada).
 */
export const LegibilityVeil: React.FC<{ side?: 'left' | 'leftNarrow' | 'center' | 'bottom' }> = ({ side = 'left' }) => {
  const cls = {
    // só a coluna de texto: a metade direita (geografia) fica limpa
    leftNarrow: 'bg-gradient-to-r from-sumi/90 via-sumi/55 via-35% to-transparent to-55%',
    left: 'bg-gradient-to-r from-sumi/95 via-sumi/75 to-transparent md:to-sumi/0',
    center: 'bg-[radial-gradient(ellipse_at_center,rgba(11,11,13,0.82)_0%,rgba(11,11,13,0.45)_45%,transparent_75%)]',
    bottom: 'bg-gradient-to-t from-sumi/95 via-sumi/60 to-transparent'
  }[side];
  return <div aria-hidden className={`pointer-events-none absolute inset-0 ${cls}`} />;
};
