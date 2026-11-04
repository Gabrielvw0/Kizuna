import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Play,
  Sliders,
  Search,
  GitPullRequest,
  TrendingUp,
} from 'lucide-react';

export const DemoModeModal: React.FC = () => {
  const {
    isDemoPanelOpen,
    setIsDemoPanelOpen,
    resetDemoState,
    setActiveModule,
    setIsArDrilldownOpen,
    setSelectedPrId,
    setCommandOpen,
    t,
  } = useKizuna();

  if (!isDemoPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]">
      <div className="w-full max-w-lg bg-slate-900 text-white border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">Kizuna Demo Mode</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Scenario: Executive Presentation (Marunouchi Enterprise Edition)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoPanelOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Checklist */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 border border-slate-800 rounded-md p-3.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ Live State</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ Simulated Data</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ Interactive Workflow</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>✓ Presentation Reset</span>
            </div>
          </div>

          {/* Quick Scenario Triggers */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('Presentation Narrative Shortcuts', 'Atalhos do Roteiro de Apresentação')}
            </div>

            <button
              onClick={() => {
                setIsDemoPanelOpen(false);
                setActiveModule('dashboard');
                setIsArDrilldownOpen(true);
              }}
              className="w-full p-3 rounded bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {t(
                      'Act 1: Investigate AR Increase (¥12.7M ↑ 14.2%)',
                      'Ato 1: Investigar Aumento do Contas a Receber (¥12.7M ↑ 14.2%)'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Dashboard → 株式会社山田 → SO-2026-10482 → INV-2026-00389 → 会計仕訳
                  </div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
            </button>

            <button
              onClick={() => {
                setIsDemoPanelOpen(false);
                setCommandOpen(true, 'SO-2026-10482');
              }}
              className="w-full p-3 rounded bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {t(
                      'Command Center (⌘K): Relational Graph Search',
                      'Command Center (⌘K): Busca com Grafo Relacional'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    SO-2026-10482 ├─ INV-2026-00389 ├─ Yamada Corp └─ JE-2026-02841
                  </div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
            </button>

            <button
              onClick={() => {
                setIsDemoPanelOpen(false);
                setSelectedPrId('PR-2026-00842');
                setActiveModule('workflow');
              }}
              className="w-full p-3 rounded bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <GitPullRequest className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    {t(
                      'Final Finale ("Wow Moment"): Ringi Approval PR-2026-00842',
                      'Momento Uau Final: Aprovar Ringi PR-2026-00842 com Hanko'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    承認待ち 3→2 | 買掛金 ¥9.84M→¥12.68M | 発注 24→25 | Audit Log +1
                  </div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
            </button>
          </div>

          {/* Reset Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {t(
                'Restore all numbers, approvals & logs to initial state:',
                'Restaurar todos os números, aprovações e logs ao início:'
              )}
            </span>
            <button
              onClick={() => {
                resetDemoState();
                setIsDemoPanelOpen(false);
              }}
              className="px-3.5 py-2 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Presentation Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
