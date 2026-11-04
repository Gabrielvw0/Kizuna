import React from 'react';
import { PresentationProvider, usePresentation } from './core/PresentationContext';
import { InputBusProvider, useInputBus } from './core/InputBus';
import { NavigationChrome } from './core/NavigationChrome';
import { VisualBackgroundEngine } from './core/VisualBackgroundEngine';
import { WorldStage } from './core/WorldStage';
import { EvidenceAndBancaPanels } from './components/strategic/EvidenceAndBancaPanels';

// 15 Interactive Strategic Experience Screens (PROMPT MESTRE — KIZUNA ERP)
import { IntroSection } from './sections/IntroSection';
import { GlobantWorldSection } from './sections/GlobantWorldSection';
import { JapanDestinySection } from './sections/JapanDestinySection';
import { GlobalLocalSection } from './sections/GlobalLocalSection';
import { TrustSection } from './sections/TrustSection';
import { ValueSection } from './sections/ValueSection';
import { MarketSection } from './sections/MarketSection';
import { AdaptationSection } from './sections/AdaptationSection';
import { AISecuritySection } from './sections/AISecuritySection';
import { RoadmapSection } from './sections/RoadmapSection';
import { MarketingMixSection } from './sections/MarketingMixSection';
import { PositioningSection } from './sections/PositioningSection';
import { PricingSection } from './sections/PricingSection';
import { MetricsSection } from './sections/MetricsSection';
import { FinaleSection } from './sections/FinaleSection';

// Live Product Demo Workspace (accessible on demand during defense)
import { KizunaProvider, useKizuna } from './context/KizunaContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ExecutiveDashboard } from './components/modules/ExecutiveDashboard';
import { BiAnalytics } from './components/modules/BiAnalytics';
import { AccountingModule } from './components/modules/AccountingModule';
import { SalesModule } from './components/modules/SalesModule';
import { ProcurementModule } from './components/modules/ProcurementModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { PartnersModule } from './components/modules/PartnersModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { WorkflowModule } from './components/modules/WorkflowModule';
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
  const { activeModule, toast, dismissToast } = useKizuna();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'analytics':
        return <BiAnalytics />;
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
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-2xl border border-rose-400 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>VOLTAR À APRESENTAÇÃO ESTRATÉGICA (ESC)</span>
      </button>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
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

const GestureBridge: React.FC = () => {
  const { onCommand } = useInputBus();
  const { nextStep, prevStep } = usePresentation();

  React.useEffect(() => {
    return onCommand((cmd) => {
      if (cmd === 'NEXT') {
        nextStep();
      } else if (cmd === 'PREV') {
        prevStep();
      } else if (cmd === 'INTERACT' || cmd === 'CONFIRM') {
        nextStep();
      }
    });
  }, [onCommand, nextStep, prevStep]);

  return null;
};

const StrategicPresentationStage: React.FC = () => {
  const { currentIndex, erpDemoOpen, setErpDemoOpen, stageMode } = usePresentation();

  const renderSection = () => {
    switch (currentIndex) {
      case 0:
        return <IntroSection />; // TELA 01: Abertura
      case 1:
        return <GlobantWorldSection />; // TELA 02: Por que o Japão?
      case 2:
        return <JapanDestinySection />; // TELA 03: R1 • Choque Cultural
      case 3:
        return <GlobalLocalSection />; // TELA 04: Global × Local
      case 4:
        return <TrustSection />; // TELA 05: Kizuna Start (¥980)
      case 5:
        return <ValueSection />; // TELA 06: Demonstração ao Vivo
      case 6:
        return <MarketSection />; // TELA 07: Expansão (Land & Expand)
      case 7:
        return <AdaptationSection />; // TELA 08: R2 • Adaptação do Produto
      case 8:
        return <AISecuritySection />; // TELA 09: Confiança, Governança e IA
      case 9:
        return <RoadmapSection />; // TELA 10: R3 • Praça + Modo de Entrada
      case 10:
        return <MarketingMixSection />; // TELA 11: R4 • Promoção
      case 11:
        return <PositioningSection />; // TELA 12: Posicionamento Competitivo
      case 12:
        return <PricingSection />; // TELA 13: Preço e Modelo de Receita
      case 13:
        return <MetricsSection />; // TELA 14: Riscos e Indicadores
      case 14:
        return <FinaleSection />; // TELA 15: Encerramento
      default:
        return <IntroSection />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05080D] text-slate-100 flex flex-col">
      {/* Gesture Bridge Listener for Camera & WebSocket inputs */}
      <GestureBridge />

      {/* Camada 1: Living 3D World Stage (Persistent Earth, Orbit, Red Thread, Tokyo Architecture & Validation Gate) */}
      <WorldStage />

      {/* Subtle Background Atmosphere & High-Contrast Safe Mode Layer */}
      <VisualBackgroundEngine />

      {/* Top & Bottom Navigation Chrome (auto-fades & hides in Stage Mode) */}
      <NavigationChrome />

      {/* Active Interactive Experience Stage */}
      <main
        key={currentIndex}
        className={`relative z-10 flex-1 overflow-hidden animate-sectionCinema transition-all duration-500 ${
          stageMode ? 'pt-0 pb-0' : 'pt-12 pb-11'
        }`}
      >
        {renderSection()}
      </main>

      {/* 15th Invisible Layer: Modo Banca (B) + Teleprompter & Camada de Evidências (E) */}
      <EvidenceAndBancaPanels />

      {/* Full Live ERP Workspace Overlay */}
      {erpDemoOpen && (
        <KizunaProvider>
          <LiveProductDemoWorkspace onClose={() => setErpDemoOpen(false)} />
        </KizunaProvider>
      )}
    </div>
  );
};

export function App() {
  return (
    <InputBusProvider>
      <PresentationProvider>
        <StrategicPresentationStage />
      </PresentationProvider>
    </InputBusProvider>
  );
}

export default App;
