import React, { useState } from 'react';
import {
  Sparkles,
  Languages,
  Calendar,
  DollarSign,
  GitPullRequest,
  BellOff,
  Stamp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, getPlan, yen } from '../data/pricing';

// Exemplo de 税抜/税込 calculado a partir do preço sugerido do Start e da alíquota em pricing.json
const EXAMPLE_NET = getPlan('start').priceMonthly;
const EXAMPLE_TAX = Math.floor(EXAMPLE_NET * PRICING.taxRate);
const TAX_PCT = Math.round(PRICING.taxRate * 100);

interface AdaptationPillar {
  id: string;
  code: string;
  title: string;
  jp: string;
  icon: React.ReactNode;
  shortDesc: string;
  previewSnippet: string;
  bullets: string[];
}

const SEVEN_PILLARS: AdaptationPillar[] = [
  {
    id: 'idioma',
    code: '01 IDIOMA',
    title: 'Keigo Corporativo Nativo',
    jp: '敬語・ビジネス日本語',
    icon: <Languages className="w-4 h-4" />,
    shortDesc: 'Interface em japonês natural e respeitoso, sem traduções mecânicas.',
    previewSnippet: '「承認申請を提出いたしました。ご確認のほどよろしくお願い申し上げます。」',
    bullets: [
      'Tratamento formal e polido adequado à hierarquia corporativa japonesa',
      'Termos de status específicos do vocabulário empresarial (承諾, 差戻し, 決裁)',
      'Proposta: documentação técnica, manuais e suporte em japonês'
    ]
  },
  {
    id: 'calendario',
    code: '02 CALENDÁRIO',
    title: 'Datas YYYY/MM/DD & Eras Imperiais',
    jp: '和暦（令和）と日付形式',
    icon: <Calendar className="w-4 h-4" />,
    shortDesc: 'Suporte nativo ao formato ocidental e à contagem imperial Reiwa (令和).',
    previewSnippet: '令和8年 (2026年) 10月27日 (火) • 決算期: 第2四半期',
    bullets: [
      'Conversão instantânea entre Gregoriano e Reiwa (令和8年)',
      'Datas ordenadas por Ano/Mês/Dia (年/月/日) sem ambiguidade',
      'Calendário fiscal japonês alinhado a Abril–Março'
    ]
  },
  {
    id: 'moeda',
    code: '03 MOEDA & IMPOSTOS',
    title: 'Iene (¥) & Imposto sobre Consumo (税抜/税込)',
    jp: `円（JPY）と消費税計算（${TAX_PCT}%）`,
    icon: <DollarSign className="w-4 h-4" />,
    shortDesc: `Cálculo de imposto sobre consumo (${TAX_PCT}%) com exibição separada 税抜 e 税込.`,
    previewSnippet: `小計: ${yen(EXAMPLE_NET)} (税抜) + 消費税 (${TAX_PCT}%): ${yen(EXAMPLE_TAX)} = 合計: ${yen(EXAMPLE_NET + EXAMPLE_TAX)} (税込)`,
    bullets: [
      'Sistema de Fatura Qualificada (Qualified Invoice System / インボイス制度)',
      'Exibição obrigatória e transparente dos valores antes e pós-imposto',
      'Arredondamento conforme as regras fiscais japonesas (a validar com a regra vigente)'
    ]
  },
  {
    id: 'hierarquia',
    code: '04 HIERARQUIA & RITUAIS',
    title: 'Nemawashi (根回し) & Ringi (稟議)',
    jp: '根回し・稟議フロー',
    icon: <GitPullRequest className="w-4 h-4" />,
    shortDesc: 'Alinhamento informal prévio que antecede a aprovação formal multi-nível.',
    previewSnippet: 'Nemawashi concluído (3 de 3 gerentes alinhados) → Submetido ao Ringi #8821',
    bullets: [
      'Espaço de pré-consenso para evitar rejeições públicas constrangedoras',
      'Fluxo formal de carimbos digitais hierárquicos em ordem de senioridade',
      'Rastreamento auditável de aprovação, devolução (差戻し) ou cancelamento'
    ]
  },
  {
    id: 'notificacoes',
    code: '05 NOTIFICAÇÕES',
    title: 'Respeito aos Horários de Trabalho',
    jp: '定時外通知抑制・マナー',
    icon: <BellOff className="w-4 h-4" />,
    shortDesc: 'Supressão inteligente de alertas fora do horário comercial japonês.',
    previewSnippet: 'Modo Silencioso Noturno Ativo: Notificações retidas até 09:00 JST.',
    bullets: [
      'Alinhado à reforma do estilo de trabalho (働き方改革), como diretriz de produto',
      'Alertas urgentes apenas mediante autorização gerencial explícita',
      'Preservação do bem-estar e redução de estresse comunicativo'
    ]
  },
  {
    id: 'relatorios',
    code: '06 RELATÓRIOS & SELO',
    title: 'Formato Kanji & Carimbo Digital (Hanko)',
    jp: '帳票出力・電子印鑑（判子）',
    icon: <Stamp className="w-4 h-4" />,
    shortDesc: 'Exportação em layout kanji com selo digital autenticado.',
    previewSnippet: '帳票作成完了 [印: 佐藤] [印: 田中] [印: 鈴木] • 改ざん防止ハッシュ付与',
    bullets: [
      'Geração de relatórios com alta densidade informacional tradicional',
      'Carimbo circular digital com data e identificador do signatário',
      'Exportação em PDF/A (formato de arquivamento de longo prazo)'
    ]
  },
  {
    id: 'compliance',
    code: '07 CONFORMIDADE LEGAL',
    title: 'APPI & JIS Q 15001 / 27001',
    jp: '個人情報保護法 (APPI) への対応方針',
    icon: <ShieldCheck className="w-4 h-4" />,
    shortDesc: 'Requisito do projeto: aderência à Lei de Proteção de Informações Pessoais do Japão (APPI), a validar com assessoria jurídica.',
    previewSnippet: 'Requisito do projeto (proposta): dados criptografados em repouso e hospedagem no Japão — sem certificação obtida.',
    bullets: [
      'Separação estrita entre exigências legais e certificações técnicas',
      'Requisito: atender à Electronic Books Preservation Act (電子帳簿保存法), a validar',
      'Proposta: residência de dados e suporte local em território japonês'
    ]
  }
];

export const AdaptationSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  const [selectedId, setSelectedId] = useState<string>('idioma');

  const activePillar =
    SEVEN_PILLARS.find((p) => p.id === selectedId) || SEVEN_PILLARS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              R2 • ADAPTAÇÃO DO PRODUTO
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              TELA 08 / 15 • OS 7 PILARES DE LOCALIZAÇÃO JAPONESA
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            NÃO BASTA TRADUZIR.{' '}
            <span className="text-red-500">É PRECISO RESPEITAR O CONTEXTO.</span>
          </h1>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400/40 text-xs font-mono text-amber-300 shrink-0">
          7 PILARES DE ADAPTAÇÃO ESTRUTURAL
        </div>
      </div>

      {/* Main 7 Pillars Grid + Dynamic Live Preview Screen */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-2">
        {/* Left 7 Cols: The 7 Pillars Buttons */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-950/95 border border-white/15 p-5 flex flex-col justify-between shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 font-bold">
              METAMORFOSE DA INTERFACE KIZUNA
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Selecione o pilar para visualizar a adaptação ao vivo
            </span>
          </div>

          <div className="space-y-2 my-auto py-2">
            {SEVEN_PILLARS.map((p) => {
              const active = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setSceneIndex(1);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-gradient-to-r from-red-950/70 to-slate-900 border-amber-400/80 shadow-[0_0_20px_rgba(212,175,55,0.25)] scale-[1.01]'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        active ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-300 font-bold">{p.code}</span>
                        <span className="text-xs font-bold text-white">{p.title}</span>
                      </div>
                      <div className="text-[10px] font-serif text-slate-400">{p.jp}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                    {p.shortDesc.slice(0, 42)}...
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
            <span>Harmonia entre flexibilidade global e rigor local</span>
            <span className="text-amber-300 font-bold">Localização Nativa</span>
          </div>
        </div>

        {/* Right 5 Cols: Live Japanese UI Metamorphosis Card */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-950/95 border border-red-500/30 p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 font-bold">
                TRANSFORMAÇÃO EM TEMPO REAL
              </span>
              <span className="text-xs font-serif text-amber-300">{activePillar.jp}</span>
            </div>

            <h2 className="text-xl font-black text-white mb-1">{activePillar.title}</h2>
            <p className="text-xs text-slate-300 mb-4">{activePillar.shortDesc}</p>

            {/* Live UI Snippet Window */}
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/30 mb-4 font-mono text-xs text-amber-200 leading-relaxed shadow-inner">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
                Visualização no Software Kizuna:
              </div>
              <div className="text-white font-medium">{activePillar.previewSnippet}</div>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              {activePillar.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">R2 • Requisitos propostos pelo projeto (sem certificação obtida)</span>
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdaptationSection;
