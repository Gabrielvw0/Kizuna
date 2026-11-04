import React, { useEffect, useRef, useState } from 'react';
import {
  Shield,
  FileSearch,
  Scale,
  Bot,
  UserCheck,
  PlayCircle,
  Database,
  CheckCircle2,
  ArrowRight,
  Lock,
  Stamp,
  AlertTriangle
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING } from '../data/pricing';

const TRUST_PILLARS = [
  {
    code: '01 SEGURANÇA',
    title: 'Controle de Acesso (RBAC)',
    jp: 'アクセス制御',
    desc: 'Permissões granulares por cargo, equipe e nível hierárquico.',
    icon: <Shield className="w-5 h-5" />
  },
  {
    code: '02 AUDITORIA',
    title: 'Histórico de Alterações (Audit Trail)',
    jp: '監査証跡',
    desc: 'Registro rastreável de quem alterou, quando e com qual justificativa.',
    icon: <FileSearch className="w-5 h-5" />
  },
  {
    code: '03 GOVERNANÇA',
    title: 'Rastreabilidade de Decisões',
    jp: '意思決定の追跡性',
    desc: 'Alinhamento total entre execução operacional e aprovação formal.',
    icon: <Scale className="w-5 h-5" />
  }
];

export const AISecuritySection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  // Cena 1: pilares de governança • Cena 2: portão bloqueado • Cena 3: execução e registro.
  // O portão só aparece desbloqueado na cena 3 (o portão 3D também abre nessa cena).
  const scene = Math.min(2, Math.max(0, sceneIndex));
  const gateApproved = scene >= 2;
  const [stampAnim, setStampAnim] = useState<boolean>(false);
  const stampTimer = useRef<number | null>(null);
  const hankoStamped = gateApproved || stampAnim;

  useEffect(() => {
    return () => {
      if (stampTimer.current) window.clearTimeout(stampTimer.current);
    };
  }, []);

  const handleApproveWithHanko = () => {
    setStampAnim(true);
    if (stampTimer.current) window.clearTimeout(stampTimer.current);
    stampTimer.current = window.setTimeout(() => {
      stampTimer.current = null;
      setStampAnim(false);
      setSceneIndex(2);
    }, 450);
  };

  const handleResetGate = () => {
    if (stampTimer.current) window.clearTimeout(stampTimer.current);
    stampTimer.current = null;
    setStampAnim(false);
    setSceneIndex(1);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 09 / 15 • CONFIANÇA &amp; GOVERNANÇA
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              守 • COFRE / PORTÃO DE VALIDAÇÃO
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            A IA PROPÕE.{' '}
            <span className="text-red-500">O HUMANO VALIDA.</span>{' '}
            <span className="text-emerald-400">O SISTEMA REGISTRA.</span>
          </h1>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-red-950/70 border-2 border-red-500/80 shadow-[0_0_25px_rgba(220,38,38,0.35)] flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-red-400" />
          <span className="text-xs md:text-sm font-black tracking-wider text-white uppercase font-mono">
            A IA NÃO DECIDE SOZINHA.
          </span>
        </div>
      </div>

      {/* Top 3 Strategic Trust Pillars */}
      <div className={`relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-2 transition-opacity duration-500 ${scene === 0 ? 'opacity-100' : 'opacity-60'}`}>
        {TRUST_PILLARS.map((pillar) => (
          <div
            key={pillar.code}
            className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-red-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-400">
                {pillar.code} • {pillar.jp}
              </span>
              <div className="p-1.5 rounded-lg bg-white/5 text-slate-200">{pillar.icon}</div>
            </div>
            <h3 className="text-sm font-bold text-white mb-0.5">{pillar.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Theatrical Red Gate Vault Stage */}
      <div className="relative z-10 flex-1 rounded-3xl bg-slate-950/95 border border-red-500/30 p-5 md:p-6 flex flex-col justify-between shadow-2xl my-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 block">
              MÓDULO DE INTELIGÊNCIA ASSISTIVA COM COFRE / PORTÃO VERMELHO
            </span>
            <div className="text-sm font-mono text-slate-300 mt-0.5">
              Caso em Análise: <span className="text-white font-bold">Proposta de Alocação de Recursos</span>{' '}
              <span className="text-[10px] text-slate-500">(simulação com dados de demonstração)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!gateApproved ? (
              <button
                onClick={handleApproveWithHanko}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-red-300 transition-all cursor-pointer animate-pulse"
              >
                <Stamp className="w-4 h-4 text-amber-200" />
                <span>Validar com Hanko (押印)</span>
              </button>
            ) : (
              <button
                onClick={handleResetGate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all cursor-pointer"
              >
                <span>Resetar Portão</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Interactive Flow Stations */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 my-auto py-3 transition-opacity duration-500 ${scene === 0 ? 'opacity-40' : 'opacity-100'}`}>
          {/* 1. Proposta da IA */}
          <div className="p-4 rounded-2xl bg-slate-900/85 border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">01 • AI提案</span>
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">A IA Propõe</div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-cyan-200 leading-relaxed">
                “Alocar <strong className="text-white">¥2.400.000 (税抜)</strong> para Fornecedor X (Tokyo SIer)”
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Detecção de economia de escala sugerida
            </div>
          </div>

          {/* 2. Red Gate Locked [CLANG] */}
          <div
            className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all duration-500 relative overflow-hidden ${
              gateApproved
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                : 'bg-red-950/80 border-red-500 shadow-[0_0_35px_rgba(220,38,38,0.45)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-red-300">02 • 承認門</span>
                {gateApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-sm font-black text-white mb-1">
                {gateApproved ? 'Portão Desbloqueado' : 'PORTÃO BLOQUEADO [CLANG]'}
              </div>
              <div className="text-xs text-slate-200 leading-relaxed mb-2">
                {gateApproved
                  ? 'Aprovação humana registrada com sucesso.'
                  : 'Nenhuma transação é concluída sem o aval formal de um responsável.'}
              </div>
            </div>

            {/* Hanko Stamp Visual */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                {hankoStamped ? '承認印: 済' : 'Aguardando Selo'}
              </span>
              <div
                className={`w-9 h-9 rounded-md border-2 flex items-center justify-center font-serif text-[10px] transition-all duration-300 ${
                  hankoStamped
                    ? 'border-red-400 bg-red-600 text-white rotate-6 scale-110 shadow-lg'
                    : 'border-white/20 bg-white/5 text-slate-400'
                }`}
              >
                承認
              </div>
            </div>
          </div>

          {/* 3. Ação Controlada */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
              gateApproved
                ? 'bg-slate-900/90 border-white/20'
                : 'bg-slate-950/60 border-white/10 opacity-40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">03 • 制御実行</span>
                <PlayCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Ação Controlada</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recurso reservado no módulo de compras e ordem de faturamento gerada com impostos calculados ({Math.round(PRICING.taxRate * 100)}% 税抜).
              </p>
            </div>
            <div className="text-[10px] font-mono text-emerald-300 mt-2">
              {gateApproved ? '✓ Execução autorizada' : 'Bloqueado no portão'}
            </div>
          </div>

          {/* 4. Audit Log Imutável */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
              gateApproved
                ? 'bg-slate-900/95 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/60 border-white/10 opacity-40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400">04 • 監査ログ</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Audit Log (demonstração)</div>
              <div className="p-2 rounded-lg bg-black/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 leading-snug">
                ID: #KZ-2026-9941
                <br />
                APROVADOR: Tanaka-san (部長)
                <br />
                TIMESTAMP: 2026-10-27 15:42 JST
                <br />
                STATUS: REGISTRADO (DEMO)
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-2">
              Trilha rastreável para auditoria corporativa
            </div>
          </div>
        </div>

        {/* Footer info & proceed */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono text-slate-300">
            {scene === 0 && (
              <>
                Governança primeiro:{' '}
                <strong className="text-white">permissões, trilha de auditoria e rastreabilidade antes de qualquer automação.</strong>
              </>
            )}
            {scene === 1 && (
              <>
                Portão fechado:{' '}
                <strong className="text-white">nenhuma execução sem o aval formal de um responsável.</strong>
              </>
            )}
            {scene === 2 && (
              <>
                Execução autorizada e registrada:{' '}
                <strong className="text-white">tecnologia rápida com responsabilidade e controle de governança humana.</strong>
              </>
            )}
          </div>
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer self-end sm:self-auto"
          >
            <span>{scene === 0 ? 'Ver o portão de validação' : scene === 1 ? 'Simular aprovação humana' : 'Avançar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default AISecuritySection;
