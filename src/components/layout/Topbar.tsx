import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { BRANCHES } from '../../data/initialErpData';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  Globe,
  Sliders,
  Check,
  ArrowRight,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    activeBranch,
    setActiveBranch,
    currentBranchInfo,
    subLang,
    setSubLang,
    kpis,
    purchaseRequests,
    setCommandOpen,
    setActiveModule,
    setSelectedPrId,
    setIsDemoPanelOpen,
    t,
  } = useKizuna();

  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingPrs = purchaseRequests.filter((p) => p.status === 'PENDING_APPROVAL');

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 shrink-0 relative z-30">
      {/* Left: Company & Branch Switcher (マルチカンパニー・拠点切替) */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsBranchMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left whitespace-nowrap"
          >
            <Building2 className="w-4 h-4 text-blue-900 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {t('DEMO COMPANY', 'EMPRESA DEMO')}
                </span>
                <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-1 rounded border border-blue-200">
                  {currentBranchInfo.code}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>{currentBranchInfo.nameJp}</span>
                <span className="hidden xl:inline text-[11px] font-normal text-slate-500">
                  ({subLang === 'EN' ? currentBranchInfo.nameEn : currentBranchInfo.namePt})
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-md shadow-xl py-2 z-50">
              {/* Branch Switcher Section */}
              <div className="px-3 pt-2 pb-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {t('Branch / unit filter (Enterprise demo)', 'Filtro de filial / unidade (demonstração Enterprise)')}
                </div>
                <div className="space-y-0.5">
                  {BRANCHES.map((b) => {
                    const isSelected = activeBranch === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setActiveBranch(b.id);
                          setIsBranchMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-950 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{b.nameJp}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              [{b.code}]
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {subLang === 'EN' ? b.nameEn : b.namePt}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-800" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Command Center Search Button (⌘K) */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden lg:flex items-center justify-between gap-6 w-80 lg:w-96 px-3 py-1.5 rounded border border-slate-300 hover:border-blue-600 bg-slate-50/80 hover:bg-white text-xs text-slate-500 transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {t(
                'Search SO-2026-10482, Yamada, PR-2026-00842...',
                'Buscar SO-2026-10482, Yamada, PR-2026-00842...'
              )}
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-200/80 text-slate-700 rounded border border-slate-300 shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Language Toggle, Notifications (🔔 3), Demo Mode, User Profile */}
      <div className="flex items-center gap-3">
        {/* Language Toggle: JP+EN (Default) vs JP+PT (Presentation) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
          <button
            onClick={() => setSubLang('EN')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              subLang === 'EN'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Japanese + English (International Corporate Standard)"
          >
            <Globe className="w-3 h-3 text-blue-800" />
            <span>JP + EN</span>
          </button>
          <button
            onClick={() => setSubLang('PT')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
              subLang === 'PT'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Japonês + Português (Modo Apresentação Banca)"
          >
            <span>JP + PT</span>
          </button>
        </div>

        {/* Notification Bell (🔔 3件の承認待ちがあります) */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs transition-colors ${
              kpis.pendingApprovalsCount > 0
                ? 'bg-amber-50/90 hover:bg-amber-100/80 border-amber-300 text-amber-950 font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Bell
              className={`w-3.5 h-3.5 ${
                kpis.pendingApprovalsCount > 0 ? 'text-amber-600' : 'text-slate-500'
              }`}
            />
            <span className="hidden xl:inline">
              {kpis.pendingApprovalsCount}件の承認待ち
            </span>
            <span className="xl:hidden font-mono font-bold">
              {kpis.pendingApprovalsCount}
            </span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-96 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
                <span className="font-bold">
                  🔔 {kpis.pendingApprovalsCount}件の承認待ちがあります
                </span>
                <span className="text-[11px] text-slate-400">
                  {t(
                    `${kpis.pendingApprovalsCount} Pending Approvals`,
                    `Você possui ${kpis.pendingApprovalsCount} aprovações pendentes`
                  )}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {pendingPrs.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500 text-center">
                    すべての稟議・承認案件が完了しています。
                  </div>
                ) : (
                  pendingPrs.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        setSelectedPrId(pr.id);
                        setActiveModule('workflow');
                      }}
                      className="w-full p-3 text-left hover:bg-blue-50/50 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                            {pr.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {pr.supplierNameJp}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          {pr.titleJp}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          申請者: {pr.requesterJp} ({pr.departmentJp})
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          ¥{pr.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-blue-700 font-semibold flex items-center justify-end gap-0.5 mt-1">
                          <span>決裁画面へ</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Discreet Demo Mode Trigger */}
        <button
          onClick={() => setIsDemoPanelOpen(true)}
          className="p-1.5 rounded border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 bg-slate-50"
          title="Kizuna Demo Mode (Scenario & Reset Controls)"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-serif font-bold flex items-center justify-center border border-slate-700">
            山田
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-bold text-slate-900">山田 太郎</div>
            <div className="text-[10px] text-slate-500">
              営業部長 • {t('Executive Auth', 'Alçada Executiva')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
