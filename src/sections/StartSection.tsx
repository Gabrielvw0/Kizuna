import React from 'react';
import { getPlan, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';

// Somente o que o módulo de Atividades (ERP de demonstração) executa de fato.
const CAPABILITIES = [
  { title: 'Atividades', text: 'Criar, definir prazo e acompanhar o status.' },
  { title: 'Equipes', text: 'Responsáveis claros e carga de trabalho visível.' },
  { title: 'Projetos', text: 'Cada atividade ligada ao projeto que ela move.' },
  { title: 'Indicadores', text: 'Andamento, atrasos e visão gerencial por equipe e projeto.' }
];

/** Tela 04 • Kizuna Start — família B (narrativa assimétrica): o escopo à esquerda, o preço à direita. */
export const StartSection: React.FC = () => {
  const start = getPlan('start');
  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="left" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:items-center gap-6 md:gap-14 overflow-y-auto">
        <div>
          <Kicker code="04" label="Kizuna Start" jp="始" />
          <DisplayTitle className="mt-4 short:mt-2">
            Começamos pela <Accent>equipe.</Accent>
          </DisplayTitle>
          <p className="mt-4 short:mt-2 max-w-xl text-base md:text-lg short:text-base text-washi-muted leading-snug">
            Sem trocar sistemas no primeiro dia: o Start organiza a rotina de uma equipe e prepara a expansão.
          </p>

          <ol className="mt-6 md:mt-8 short:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-washi/10">
            {CAPABILITIES.map(({ title, text }, i) => (
              <li key={title} className="flex gap-4 py-3 md:py-4 short:py-2 border-b border-washi/10">
                <span className="font-display text-lg md:text-xl text-beni-soft tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="text-lg md:text-xl short:text-base font-semibold text-washi">{title}</div>
                  <p className="mt-0.5 text-sm md:text-base short:text-sm text-washi-muted leading-snug">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="md:border-l md:border-beni/40 md:pl-8">
          <div className="text-xs md:text-sm uppercase tracking-[0.22em] text-washi-dim">Por usuário / mês</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-semibold text-washi leading-none text-6xl md:text-7xl lg:text-8xl short:text-6xl tabular-nums">
              {yen(start.priceMonthly)}
            </span>
            <span className="font-display text-lg text-kin-soft">税抜</span>
          </div>
          <div className="mt-3">
            <Classification kind="preco" />
          </div>
          <p className="mt-5 text-sm md:text-base text-washi-muted leading-snug">
            {start.integrationPolicy}. É exatamente este escopo que a demonstração a seguir executa.
          </p>
        </aside>
      </div>
    </div>
  );
};
export default StartSection;
