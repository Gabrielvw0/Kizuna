import React from 'react';
import { ListChecks, Users, FolderKanban, BarChart3 } from 'lucide-react';
import { getPlan, yen } from '../data/pricing';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

// Somente o que o módulo de Atividades (ERP de demonstração) executa de fato.
const CAPABILITIES = [
  { icon: ListChecks, title: 'Atividades', text: 'Criar, definir prazo e acompanhar o status.' },
  { icon: Users, title: 'Equipes', text: 'Responsáveis claros e carga de trabalho visível.' },
  { icon: FolderKanban, title: 'Projetos', text: 'Cada atividade ligada ao projeto que ela move.' },
  { icon: BarChart3, title: 'Indicadores', text: 'Andamento, atrasos e visão gerencial por equipe e projeto.' }
];

/** Tela 04 • Kizuna Start — impacto curto: o ponto de entrada. */
export const StartSection: React.FC = () => {
  const start = getPlan('start');
  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-4 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="04 • Kizuna Start • 始"
        title={
          <>
            Começamos pela <span className="text-rose-500">equipe.</span>
          </>
        }
        aside={
          <div className="px-5 py-3 rounded-2xl bg-slate-950/85 border border-rose-500/40">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white">{yen(start.priceMonthly)}</span>
              <span className="text-xs font-mono text-slate-300">/ usuário/mês</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">税抜</span>
            </div>
            <div className="mt-1">
              <InfoTag kind="preco" />
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CAPABILITIES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="p-4 rounded-2xl bg-slate-950/85 border border-white/15">
            <Icon className="w-6 h-6 text-rose-400" />
            <div className="mt-3 text-lg font-black text-white">{title}</div>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-snug">{text}</p>
          </div>
        ))}
      </div>

      <p className="text-base sm:text-lg text-white font-semibold">
        Sem trocar sistemas no primeiro dia: o Start organiza a rotina de uma equipe e prepara a expansão.
        <span className="block mt-1 text-xs font-normal text-slate-400">
          {start.integrationPolicy}. É exatamente este escopo que a demonstração a seguir executa.
        </span>
      </p>
    </div>
  );
};
export default StartSection;
