import React, { useEffect, useReducer, useRef, useSyncExternalStore } from 'react';
import { FrozenPresentation, PresentationProvider, usePresentation } from './core/PresentationContext';
import { uiBus } from './core/transitions/uiBus';
import { prefersReducedMotion, transitionKind } from './core/transitions/plans';
import { NavigationChrome } from './core/NavigationChrome';
import { VisualBackgroundEngine } from './core/VisualBackgroundEngine';
import { WorldStage } from './core/WorldStage';
import { EvidenceAndBancaPanels } from './components/strategic/EvidenceAndBancaPanels';

// 12 telas narrativas (ordem e mapeamento técnico em core/narrativeMap.ts)
import { SCREEN } from './core/narrativeMap';
import { IntroSection } from './sections/IntroSection';
import { WhyJapanSection } from './sections/WhyJapanSection';
import { ContextSection } from './sections/ContextSection';
import { StartSection } from './sections/StartSection';
import { DemoSection } from './sections/DemoSection';
import { AdaptationSection } from './sections/AdaptationSection';
import { AISecuritySection } from './sections/AISecuritySection';
import { PlansSection } from './sections/PlansSection';
import { EntrySection } from './sections/EntrySection';
import { PositioningSection } from './sections/PositioningSection';
import { RisksSection } from './sections/RisksSection';
import { FinaleSection } from './sections/FinaleSection';

// Live Product Demo Workspace (accessible on demand during defense)
import { KizunaProvider, useKizuna } from './context/KizunaContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ActivitiesModule } from './components/modules/ActivitiesModule';
import { MODULE_PLAN, PLAN_CONTEXT_NOTE } from './data/erpModulePlans';
import { ExecutiveDashboard } from './components/modules/ExecutiveDashboard';
import { BiAnalytics } from './components/modules/BiAnalytics';
import { AccountingModule } from './components/modules/AccountingModule';
import { SalesModule } from './components/modules/SalesModule';
import { ProcurementModule } from './components/modules/ProcurementModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { PartnersModule } from './components/modules/PartnersModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { WorkflowModule } from './components/modules/WorkflowModule';
import { AiIntelligenceModule } from './components/modules/AiIntelligenceModule';
import { ComplianceAuditModule } from './components/modules/ComplianceAuditModule';
import { HrProductionModule } from './components/modules/HrProductionModule';
import { CommandCenterModal } from './components/shared/CommandCenterModal';
import { ArDrilldownModal } from './components/shared/ArDrilldownModal';
import { PartnerDrawer } from './components/shared/PartnerDrawer';
import { OrderInvoiceDrawer } from './components/shared/OrderInvoiceDrawer';
import { PdfDocumentModal } from './components/shared/PdfDocumentModal';
import { DemoModeModal } from './components/shared/DemoModeModal';
import { CheckCircle2, X, ArrowLeft } from 'lucide-react';

const LiveProductDemoWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeModule, toast, dismissToast, t } = useKizuna();
  const planNote = PLAN_CONTEXT_NOTE[MODULE_PLAN[activeModule]];

  const renderModule = () => {
    switch (activeModule) {
      case 'activities':
        return <ActivitiesModule />;
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'analytics':
        return <BiAnalytics />;
      case 'ai':
        // Antes caía no default e repetia o Dashboard Executivo (tela duplicada).
        return <AiIntelligenceModule />;
      case 'accounting':
        return <AccountingModule />;
      case 'sales':
        return <SalesModule />;
      case 'procurement':
        return <ProcurementModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'partners':
        return <PartnersModule />;
      case 'documents':
        return <DocumentsModule />;
      case 'workflow':
        return <WorkflowModule />;
      case 'compliance':
      case 'audit':
        return <ComplianceAuditModule />;
      case 'hr':
      case 'production':
        return <HrProductionModule />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 animate-erpDescent">
      <button
        onClick={onClose}
        className="fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-2xl border border-rose-400 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLTAR À APRESENTAÇÃO (ESC)</span>
      </button>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <div className="shrink-0 bg-amber-100 border-b border-amber-300 px-5 py-1 text-[11px] font-semibold text-amber-950 flex flex-wrap items-center justify-between gap-x-4">
          <span>
            {t('DEMONSTRATION • FICTITIOUS DATA', 'DEMONSTRAÇÃO • DADOS FICTÍCIOS')}
          </span>
          <span className="font-normal">
            {t(
              'Names, addresses, banks, figures and dates are examples. They do not represent real customers, results or integrations.',
              'Nomes, endereços, bancos, valores e datas são exemplos. Não representam clientes, resultados ou integrações reais.'
            )}
          </span>
        </div>
        <div className={`shrink-0 border-b px-5 py-1.5 text-[11px] font-semibold ${planNote.cls}`}>
          {t(planNote.en, planNote.pt)}
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto">{renderModule()}</div>
        </main>
      </div>

      <CommandCenterModal />
      <ArDrilldownModal />
      <PartnerDrawer />
      <OrderInvoiceDrawer />
      <PdfDocumentModal />
      <DemoModeModal />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white border border-slate-700 rounded-md shadow-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white">{toast.titleJp}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">{toast.subtitle}</div>
            {toast.metricsDelta && (
              <div className="mt-2 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-semibold">
                {toast.metricsDelta}
              </div>
            )}
          </div>
          <button onClick={dismissToast} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const StrategicPresentationStage: React.FC = () => {
  const { currentIndex, sceneIndex, erpDemoOpen, setErpDemoOpen, stageMode, safeMode } = usePresentation();

  // Etapa 11: durante uma transição espacial, a interface da origem permanece (congelada) até o mundo 3D
  // avisar que a câmera chegou ao ponto narrativo combinado; só então a tela de destino entra.
  const releaseSeq = useSyncExternalStore(uiBus.subscribe, uiBus.getReleaseSeq);
  const lastRef = useRef({ index: currentIndex, scene: sceneIndex });
  const holdRef = useRef<{ index: number; scene: number; seq: number } | null>(null);
  if (currentIndex !== lastRef.current.index) {
    const hold = holdRef.current;
    if (hold && hold.index === currentIndex) holdRef.current = null; // voltou à origem: nada a reter
    else if (!hold && !safeMode && transitionKind(lastRef.current.index, currentIndex, prefersReducedMotion()) !== 'none') {
      holdRef.current = { ...lastRef.current, seq: uiBus.getReleaseSeq() };
    }
  }
  if (holdRef.current && releaseSeq > holdRef.current.seq) holdRef.current = null;
  lastRef.current = { index: currentIndex, scene: sceneIndex };
  const held = holdRef.current;
  const shownIndex = held ? held.index : currentIndex;
  // rede de segurança: se o mundo 3D não responder (ex.: sem WebGL), a interface nunca fica presa
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!held) return;
    const t = window.setTimeout(() => {
      if (holdRef.current === held) {
        holdRef.current = null;
        forceRender();
      }
    }, 4500);
    return () => window.clearTimeout(t);
  }, [held]);

  const renderSection = (index: number) => {
    switch (index) {
      case SCREEN.OPENING:
        return <IntroSection />;
      case SCREEN.WHY_JAPAN:
        return <WhyJapanSection />;
      case SCREEN.CONTEXT:
        return <ContextSection />;
      case SCREEN.START:
        return <StartSection />;
      case SCREEN.DEMO:
        return <DemoSection />;
      case SCREEN.ADAPTATION:
        return <AdaptationSection />;
      case SCREEN.TRUST:
        return <AISecuritySection />;
      case SCREEN.PLANS:
        return <PlansSection />;
      case SCREEN.ENTRY:
        return <EntrySection />;
      case SCREEN.POSITIONING:
        return <PositioningSection />;
      case SCREEN.RISKS:
        return <RisksSection />;
      case SCREEN.CLOSING:
        return <FinaleSection />;
      default:
        return <IntroSection />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05080D] text-slate-100 flex flex-col">
      {/* Camada 1: Living 3D World Stage (Globo geográfico, Tokyo Architecture & Validation Gate) */}
      <WorldStage />

      {/* Subtle Background Atmosphere & High-Contrast Safe Mode Layer */}
      <VisualBackgroundEngine />

      {/* Top & Bottom Navigation Chrome (auto-fades & hides in Stage Mode) */}
      <NavigationChrome />

      {/* Active Interactive Experience Stage */}
      <FrozenPresentation frozen={held}>
        <main
          key={shownIndex}
          className={`relative z-10 flex-1 overflow-hidden animate-sectionCinema transition-all duration-500 ${
            stageMode ? 'pt-0 pb-0' : 'pt-12 pb-11'
          }`}
        >
          {/* Etapa 11: opacidade da travessia (a animação de entrada do <main> fixa a própria opacidade) */}
          <div className="h-full w-full" style={{ opacity: 'var(--kz-ui-opacity, 1)' }}>
            {renderSection(shownIndex)}
          </div>
        </main>
      </FrozenPresentation>

      {/* Etapa 11: véu curto das transições simplificadas (saltos, movimento reduzido) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[15] bg-[#05080D]" style={{ opacity: 'var(--kz-veil, 0)' }} />

      {/* 15th Invisible Layer: Modo Banca (B) + Teleprompter & Camada de Evidências (E) */}
      <EvidenceAndBancaPanels />

      {/* Full Live ERP Workspace Overlay */}
      {erpDemoOpen && <LiveProductDemoWorkspace onClose={() => setErpDemoOpen(false)} />}
    </div>
  );
};

export function App() {
  return (
    <PresentationProvider>
      <KizunaProvider>
        <StrategicPresentationStage />
      </KizunaProvider>
    </PresentationProvider>
  );
}

export default App;
