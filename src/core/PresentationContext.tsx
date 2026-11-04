import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import sourcesData from '../data/sources.json';
import { getPlan, scaleStory, yen } from '../data/pricing';
import { SCREEN, checkNarrativeMap } from './narrativeMap';

// Preços exibidos nos rótulos de navegação vêm de pricing.json (fonte única)
const PRICE = {
  start: yen(getPlan('start').priceMonthly),
  business: yen(getPlan('business').priceMonthly),
  enterprise: yen(getPlan('enterprise').priceMonthly)
};

export interface SectionMeta {
  index: number;
  code: string;
  id: string;
  shortTitle: string;
  fullTitle: string;
  rBadge?: string; // e.g. "R1 • CHOQUE CULTURAL"
  bgThemeName: string;
  storyQuestion: string;
  metamorphosisFromTo: string;
  narrativeNode: string;
  kanji: string;
  sceneCount: number;
  sceneLabels: string[];
  /** Chave do bloco correspondente em sources.json (banca e evidências). */
  sourceKey?: string;
}

export const PRESENTATION_SECTIONS: SectionMeta[] = [
  {
    index: 0,
    code: '01',
    id: 'abertura',
    shortTitle: 'ABERTURA',
    fullTitle: '01 | KIZUNA — Global Reach. Local Trust.',
    bgThemeName: 'Sumi & Orbital Earth',
    storyQuestion: 'Como levar uma solução de gestão de equipes ao Japão, onde a decisão depende de confiança?',
    metamorphosisFromTo: 'Mundo → Fio Vermelho (赤い糸) → Japão → 絆 Kizuna',
    narrativeNode: 'MUNDO',
    kanji: '絆',
    sceneCount: 2,
    sceneLabels: ['O fio vermelho', 'KIZUNA 絆']
  },
  {
    index: 1,
    code: '02',
    id: 'japao',
    shortTitle: 'POR QUE O JAPÃO?',
    fullTitle: '02 | POR QUE O JAPÃO? — Oportunidade que exige contexto',
    bgThemeName: 'Tokyo Skyline',
    storyQuestion: 'Por que o Japão é uma oportunidade real para uma solução de gestão de equipes?',
    metamorphosisFromTo: 'PMEs + pressão por modernização → Ponte Brasil–Japão (1908)',
    narrativeNode: 'JAPÃO',
    kanji: '日',
    sceneCount: 2,
    sceneLabels: ['A oportunidade em dois números', 'A ponte Brasil ↔ Japão (1908)']
  },
  {
    index: 2,
    code: '03',
    id: 'contexto',
    shortTitle: 'O JAPÃO EXIGE CONTEXTO',
    fullTitle: '03 | O JAPÃO EXIGE CONTEXTO',
    rBadge: 'R1 • CHOQUE CULTURAL',
    bgThemeName: 'Four Doors',
    storyQuestion: 'O que muda para um produto estrangeiro ao entrar no Japão?',
    metamorphosisFromTo: 'Cultura → Idioma → Hábitos → Regulação → Global × Local = 絆',
    narrativeNode: 'PROBLEMA',
    kanji: '門',
    sceneCount: 5,
    sceneLabels: ['Porta 1: Cultura', 'Porta 2: Idioma', 'Porta 3: Hábitos empresariais', 'Porta 4: Regulação', 'Global × Local']
  },
  {
    index: 3,
    code: '04',
    id: 'kizuna-start',
    shortTitle: 'KIZUNA START',
    fullTitle: `04 | COMEÇAMOS PELA EQUIPE — Kizuna Start (${PRICE.start})`,
    bgThemeName: 'Team Core',
    storyQuestion: 'Por onde o Kizuna começa a gerar valor sem exigir a troca de sistemas?',
    metamorphosisFromTo: 'Atividades + Equipes + Projetos + Indicadores → Kizuna Start',
    narrativeNode: 'KIZUNA',
    kanji: '始',
    sceneCount: 1,
    sceneLabels: [`Kizuna Start (${PRICE.start} 税抜)`]
  },
  {
    index: 4,
    code: '05',
    id: 'demonstracao',
    shortTitle: 'DEMONSTRAÇÃO',
    fullTitle: '05 | DEMONSTRAÇÃO REAL — Kizuna Start',
    bgThemeName: 'Live Data Thread',
    storyQuestion: 'Como a informação nasce na equipe e chega à gestão?',
    metamorphosisFromTo: 'Criar → Atribuir → Executar → Projeto → Visão da gestão',
    narrativeNode: 'PRODUTO',
    kanji: '動',
    sceneCount: 5,
    sceneLabels: [
      '1. Criar a atividade',
      '2. Responsável e prazo',
      '3. Acompanhar a execução',
      '4. Relacionar ao projeto',
      '5. Visão da gestão'
    ]
  },
  {
    index: 5,
    code: '06',
    id: 'adaptacao',
    shortTitle: 'ADAPTAÇÃO',
    fullTitle: '06 | NÃO BASTA TRADUZIR — Adaptação ao Japão',
    rBadge: 'R2 • ADAPTAÇÃO DO PRODUTO',
    bgThemeName: 'Kintsugi & Ringi',
    storyQuestion: 'Como o Kizuna se adapta ao idioma, ao calendário, à moeda, ao Ringi e às leis japonesas?',
    metamorphosisFromTo: 'Keigo + Datas & Moeda → Ringi & Nemawashi + Conformidade',
    narrativeNode: 'ADAPTAÇÃO',
    kanji: '和',
    sceneCount: 2,
    sceneLabels: ['Idioma, datas e moeda', 'Rituais de aprovação e conformidade']
  },
  {
    index: 6,
    code: '07',
    id: 'confianca',
    shortTitle: 'CONFIANÇA',
    fullTitle: '07 | A IA PROPÕE. O HUMANO VALIDA. O SISTEMA REGISTRA.',
    bgThemeName: 'Red Validation Gate',
    storyQuestion: 'Como a automação respeita a aprovação humana e deixa rastro?',
    metamorphosisFromTo: 'Proposta → Portão fechado → Hanko → Execução e registro',
    narrativeNode: 'CONFIANÇA',
    kanji: '守',
    sceneCount: 2,
    sceneLabels: ['Portão fechado', 'Decisão humana (Hanko)']
  },
  {
    index: 7,
    code: '08',
    id: 'planos',
    shortTitle: 'PLANOS & RECEITA',
    fullTitle: `08 | PLANOS E MODELO DE RECEITA — ${PRICE.start} • ${PRICE.business} • ${PRICE.enterprise}`,
    bgThemeName: 'Land & Expand',
    storyQuestion: 'Como o Kizuna cresce com o cliente e como gera receita?',
    metamorphosisFromTo: `Start → Business → Enterprise → Simulador ${scaleStory}`,
    narrativeNode: 'NEGÓCIO',
    kanji: '価',
    sceneCount: 2,
    sceneLabels: ['Land & Expand: escopo de cada plano', `Simulador de receita (${scaleStory})`]
  },
  {
    index: 8,
    code: '09',
    id: 'entrada',
    shortTitle: 'ENTRADA & AQUISIÇÃO',
    fullTitle: '09 | ESTRATÉGIA DE ENTRADA E AQUISIÇÃO B2B',
    rBadge: 'R3 + R4 • PRAÇA & PROMOÇÃO',
    bgThemeName: 'Railway & Broadcast',
    storyQuestion: 'Como entramos no Japão reduzindo risco e como conquistamos os primeiros clientes?',
    metamorphosisFromTo: 'Parceiro → Pilotos → Referências → Expansão → (Subsidiária?) → Canais B2B',
    narrativeNode: 'MERCADO',
    kanji: '道',
    sceneCount: 4,
    sceneLabels: [
      'R3 • Parceiro local e pilotos',
      'R3 • Referências e expansão',
      'R3 • Subsidiária (hipótese futura)',
      'R4 • Mensagem, canais e funil'
    ]
  },
  {
    index: 9,
    code: '10',
    id: 'posicionamento',
    shortTitle: 'POSICIONAMENTO',
    fullTitle: '10 | POSICIONAMENTO — Proposta estratégica',
    bgThemeName: 'Strategic 2x2 Matrix',
    storyQuestion: 'Se o Japão já possui sistemas, por que escolher o Kizuna?',
    metamorphosisFromTo: 'Alternativas do mercado → Posição-alvo proposta',
    narrativeNode: 'NEGÓCIO',
    kanji: '位',
    sceneCount: 2,
    sceneLabels: ['As alternativas existentes', 'A posição-alvo do Kizuna']
  },
  {
    index: 10,
    code: '11',
    id: 'riscos',
    shortTitle: 'RISCOS & 12 MESES',
    fullTitle: '11 | RISCOS E PLANEJAMENTO DE 12 MESES',
    bgThemeName: 'Risk & Milestones',
    storyQuestion: 'Quais riscos vigiamos e quais marcos propomos para o primeiro ano?',
    metamorphosisFromTo: '4 riscos e respostas → marcos propostos de 12 meses',
    narrativeNode: 'NEGÓCIO',
    kanji: '標',
    sceneCount: 2,
    sceneLabels: ['4 riscos e respostas', 'Marcos propostos de 12 meses']
  },
  {
    index: 11,
    code: '12',
    id: 'encerramento',
    shortTitle: 'ENCERRAMENTO',
    fullTitle: '12 | 絆 KIZUNA — Global Reach. Local Trust.',
    bgThemeName: 'Full Circle Red Thread',
    storyQuestion: 'O que permanece depois da apresentação?',
    metamorphosisFromTo: 'Equipe → Confiança → Expansão → 絆',
    narrativeNode: 'FUTURO',
    kanji: '絆',
    sceneCount: 1,
    sceneLabels: ['絆 Global Reach. Local Trust.']
  }
];

// Simulação de reserva: só pode ser ativada na tela de demonstração,
// com um passo a cada 2,4 s, e termina sozinha ao chegar no último passo.
const BACKUP_SIM_SECTION_INDEX = SCREEN.DEMO;
const BACKUP_SIM_STEP_MS = 2400;
// Portão da tela de confiança: a cena em que a decisão humana pode ocorrer.
const GATE_DECISION_SCENE = 1;

// Confere em desenvolvimento que roteiro e mapa técnico têm as mesmas cenas.
const NARRATIVE_MAP_PROBLEMS = checkNarrativeMap(PRESENTATION_SECTIONS.map((s) => s.sceneCount));
if (NARRATIVE_MAP_PROBLEMS.length > 0) {
  console.error('[Kizuna] Mapa narrativo inconsistente:', NARRATIVE_MAP_PROBLEMS);
}

export interface CommandCue {
  id: number;
  label: string;
  detail: string;
}

interface PresentationContextType {
  currentIndex: number;
  sceneIndex: number;
  currentSection: SectionMeta;
  totalSections: number;
  stageMode: boolean;
  safeMode: boolean;
  bancaMode: boolean;
  evidenceOpen: boolean;
  erpDemoOpen: boolean;
  navMenuOpen: boolean;
  backupVideoMode: boolean;
  gateApproved: boolean;
  approveGate: () => void;
  revokeGate: () => void;
  isFullscreen: boolean;
  commandCue: CommandCue | null;
  goToSection: (index: number, initialScene?: number) => void;
  setSceneIndex: (sceneIdx: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextSection: () => void;
  prevSection: () => void;
  resetCurrentScene: () => void;
  toggleStageMode: () => void;
  toggleSafeMode: () => void;
  toggleBancaMode: () => void;
  toggleEvidence: () => void;
  toggleNavMenu: () => void;
  setNavMenuOpen: (open: boolean) => void;
  toggleBackupSimulation: () => void;
  setEvidenceOpen: (open: boolean) => void;
  setErpDemoOpen: (open: boolean) => void;
  toggleFullscreen: () => void;
  currentSectionData: (typeof sourcesData.sections)['01'];
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sceneIndex, setSceneIndexState] = useState<number>(0);
  const [stageMode, setStageMode] = useState<boolean>(false);
  const [safeMode, setSafeMode] = useState<boolean>(false);
  const [bancaMode, setBancaMode] = useState<boolean>(false);
  const [evidenceOpen, setEvidenceOpen] = useState<boolean>(false);
  const [erpDemoOpen, setErpDemoOpen] = useState<boolean>(false);
  const [navMenuOpen, setNavMenuOpen] = useState<boolean>(false);
  const [backupVideoMode, setBackupVideoMode] = useState<boolean>(false);
  // Aprovação humana da tela 09: só muda por clique explícito no Hanko (nunca por navegação).
  const [gateApproved, setGateApproved] = useState<boolean>(false);
  const approveGate = useCallback(() => setGateApproved(true), []);
  const revokeGate = useCallback(() => setGateApproved(false), []);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [commandCue, setCommandCue] = useState<CommandCue | null>(null);
  const cueTimerRef = useRef<number | null>(null);

  const totalSections = PRESENTATION_SECTIONS.length;
  const currentSection = PRESENTATION_SECTIONS[currentIndex];
  const sectionKey = (currentSection.sourceKey ?? currentSection.code) as keyof typeof sourcesData.sections;
  const currentSectionData = sourcesData.sections[sectionKey] || sourcesData.sections['01'];

  const triggerCue = useCallback((label: string, detail: string) => {
    if (cueTimerRef.current) window.clearTimeout(cueTimerRef.current);
    setCommandCue({ id: Date.now(), label, detail });
    cueTimerRef.current = window.setTimeout(() => {
      setCommandCue(null);
    }, 950);
  }, []);

  const goToSection = useCallback(
    (index: number, initialScene = 0) => {
      if (index < 0 || index >= totalSections) return;
      const targetSec = PRESENTATION_SECTIONS[index];
      const clampedScene = Math.max(0, Math.min(targetSec.sceneCount - 1, initialScene));
      setBackupVideoMode(false);
      setCurrentIndex(index);
      setSceneIndexState(clampedScene);
      setNavMenuOpen(false);
    },
    [totalSections]
  );

  const setSceneIndex = useCallback(
    (sceneIdx: number) => {
      const clamped = Math.max(0, Math.min(currentSection.sceneCount - 1, sceneIdx));
      setBackupVideoMode(false); // qualquer escolha manual de cena interrompe a simulação
      setSceneIndexState(clamped);
    },
    [currentSection.sceneCount]
  );

  const nextStep = useCallback(() => {
    setBackupVideoMode(false);
    if (sceneIndex < currentSection.sceneCount - 1) {
      const nextSc = sceneIndex + 1;
      setSceneIndexState(nextSc);
      triggerCue('NEXT', `TELA ${currentSection.code} • CENA ${nextSc + 1}/${currentSection.sceneCount}`);
    } else if (currentIndex < totalSections - 1) {
      const nextSec = PRESENTATION_SECTIONS[currentIndex + 1];
      setCurrentIndex((prev) => prev + 1);
      setSceneIndexState(0);
      triggerCue('NEXT SCREEN', `TELA ${nextSec.code} • ${nextSec.shortTitle}`);
    }
  }, [sceneIndex, currentSection, currentIndex, totalSections, triggerCue]);

  const prevStep = useCallback(() => {
    setBackupVideoMode(false);
    if (sceneIndex > 0) {
      const prevSc = sceneIndex - 1;
      setSceneIndexState(prevSc);
      triggerCue('PREV', `TELA ${currentSection.code} • CENA ${prevSc + 1}/${currentSection.sceneCount}`);
    } else if (currentIndex > 0) {
      const prevSecIndex = currentIndex - 1;
      const prevSec = PRESENTATION_SECTIONS[prevSecIndex];
      setCurrentIndex(prevSecIndex);
      setSceneIndexState(prevSec.sceneCount - 1);
      triggerCue('PREV SCREEN', `TELA ${prevSec.code} • ${prevSec.shortTitle}`);
    }
  }, [sceneIndex, currentIndex, currentSection, triggerCue]);

  const nextSection = useCallback(() => {
    setBackupVideoMode(false);
    if (currentIndex < totalSections - 1) {
      const nextSec = PRESENTATION_SECTIONS[currentIndex + 1];
      setCurrentIndex((prev) => prev + 1);
      setSceneIndexState(0);
      triggerCue('TELA', `${nextSec.code} • ${nextSec.shortTitle}`);
    }
  }, [currentIndex, totalSections, triggerCue]);

  const prevSection = useCallback(() => {
    setBackupVideoMode(false);
    if (currentIndex > 0) {
      const prevSec = PRESENTATION_SECTIONS[currentIndex - 1];
      setCurrentIndex((prev) => prev - 1);
      setSceneIndexState(0);
      triggerCue('TELA', `${prevSec.code} • ${prevSec.shortTitle}`);
    }
  }, [currentIndex, triggerCue]);

  const resetCurrentScene = useCallback(() => {
    setBackupVideoMode(false);
    setGateApproved(false);
    setSceneIndexState(0);
    triggerCue('RESET', `TELA ${currentSection.code} • CENA 1/${currentSection.sceneCount}`);
  }, [currentSection, triggerCue]);

  // Único ponto que pode LIGAR a simulação de reserva: só vale na tela 06.
  const toggleBackupSimulation = useCallback(() => {
    if (currentIndex !== BACKUP_SIM_SECTION_INDEX || erpDemoOpen) return;
    if (backupVideoMode) {
      setBackupVideoMode(false);
      triggerCue('SIMULAÇÃO INTERROMPIDA', 'Controle manual');
      return;
    }
    if (sceneIndex >= currentSection.sceneCount - 1) setSceneIndexState(0);
    setBackupVideoMode(true);
    triggerCue('SIMULAÇÃO DE RESERVA', 'Automática • ESC ou ← → para assumir');
  }, [currentIndex, erpDemoOpen, backupVideoMode, sceneIndex, currentSection, triggerCue]);

  // A aprovação nunca sobrevive à saída da tela 09 nem ao retorno às cenas 1 e 2.
  useEffect(() => {
    if (currentIndex !== SCREEN.TRUST || sceneIndex < GATE_DECISION_SCENE) setGateApproved(false);
  }, [currentIndex, sceneIndex]);

  // Rede de segurança: fora da tela 06 (ou com o ERP aberto) a simulação nunca fica ligada.
  useEffect(() => {
    if (currentIndex !== BACKUP_SIM_SECTION_INDEX || erpDemoOpen) setBackupVideoMode(false);
  }, [currentIndex, erpDemoOpen]);

  // Único temporizador da simulação: um passo a cada 2,4 s; ao chegar ao último passo, encerra.
  useEffect(() => {
    if (!backupVideoMode || currentIndex !== BACKUP_SIM_SECTION_INDEX) return;
    if (sceneIndex >= currentSection.sceneCount - 1) {
      setBackupVideoMode(false);
      return;
    }
    const timer = window.setTimeout(() => setSceneIndexState(sceneIndex + 1), BACKUP_SIM_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [backupVideoMode, currentIndex, sceneIndex, currentSection.sceneCount]);

  const toggleStageMode = useCallback(() => {
    setStageMode((prev) => {
      const next = !prev;
      triggerCue(next ? 'MODO APRESENTAÇÃO' : 'MODO CONTROLE', next ? 'Interface Oculta' : 'Controles Visíveis');
      return next;
    });
  }, [triggerCue]);

  const toggleSafeMode = useCallback(() => {
    setSafeMode((prev) => {
      const next = !prev;
      triggerCue(next ? 'MODO SEGURO ATIVO' : 'MODO WEBGL ATIVO', next ? 'Efeitos Pesados Desativados' : 'Animações Completas');
      return next;
    });
  }, [triggerCue]);

  const toggleBancaMode = useCallback(() => {
    setBancaMode((prev) => {
      const next = !prev;
      triggerCue(next ? 'ROTEIRO & BANCA' : 'PALCO', next ? 'Fala do Apresentador + Defesa' : 'Fechado');
      return next;
    });
  }, [triggerCue]);

  const toggleEvidence = useCallback(() => {
    setEvidenceOpen((prev) => {
      const next = !prev;
      triggerCue(next ? 'FONTES & EVIDÊNCIAS' : 'PALCO', next ? 'Dados & Premissas' : 'Fechado');
      return next;
    });
  }, [triggerCue]);

  const toggleNavMenu = useCallback(() => {
    setNavMenuOpen((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Atalhos do navegador (Ctrl+R, Ctrl+F, Alt+←…) não pertencem à apresentação.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (backupVideoMode) {
          setBackupVideoMode(false);
          return;
        }
        if (evidenceOpen) {
          setEvidenceOpen(false);
          return;
        }
        if (bancaMode) {
          setBancaMode(false);
          return;
        }
        if (erpDemoOpen) {
          setErpDemoOpen(false);
          return;
        }
        setNavMenuOpen((prev) => !prev);
        return;
      }

      if (erpDemoOpen) return;

      const isNavKey = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'PageUp';
      // Com uma janela modal aberta (fontes ou menu), as teclas de navegação não mexem na apresentação.
      if (isNavKey && (evidenceOpen || navMenuOpen)) {
        e.preventDefault();
        return;
      }
      // Tecla segurada não dispara uma sequência de cenas.
      if (isNavKey && e.repeat) {
        e.preventDefault();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        // Espaço sempre avança (mesmo com um botão em foco, para não repetir o último clique).
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Enter') {
        // Enter só confirma a opção em foco (comportamento nativo do botão); nunca avança a cena.
        if (tag !== 'BUTTON' && tag !== 'A') e.preventDefault();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggleStageMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSafeMode();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        toggleBackupSimulation();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetCurrentScene();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        toggleBancaMode();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        toggleEvidence();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    nextStep,
    prevStep,
    toggleStageMode,
    toggleSafeMode,
    resetCurrentScene,
    toggleBancaMode,
    toggleEvidence,
    toggleFullscreen,
    triggerCue,
    toggleBackupSimulation,
    backupVideoMode,
    evidenceOpen,
    navMenuOpen,
    bancaMode,
    erpDemoOpen
  ]);

  return (
    <PresentationContext.Provider
      value={{
        currentIndex,
        sceneIndex,
        currentSection,
        totalSections,
        stageMode,
        safeMode,
        bancaMode,
        evidenceOpen,
        erpDemoOpen,
        navMenuOpen,
        backupVideoMode,
        gateApproved,
        approveGate,
        revokeGate,
        isFullscreen,
        commandCue,
        goToSection,
        setSceneIndex,
        nextStep,
        prevStep,
        nextSection,
        prevSection,
        resetCurrentScene,
        toggleStageMode,
        toggleSafeMode,
        toggleBancaMode,
        toggleEvidence,
        toggleNavMenu,
        setNavMenuOpen,
        toggleBackupSimulation,
        setEvidenceOpen,
        setErpDemoOpen,
        toggleFullscreen,
        currentSectionData
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = (): PresentationContextType => {
  const ctx = useContext(PresentationContext);
  if (!ctx) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return ctx;
};
