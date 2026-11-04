import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import sourcesData from '../data/sources.json';

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
}

export const PRESENTATION_SECTIONS: SectionMeta[] = [
  {
    index: 0,
    code: '01',
    id: 'abertura',
    shortTitle: 'ABERTURA',
    fullTitle: '01 | KIZUNA — Global Reach. Local Trust.',
    bgThemeName: 'Sumi & Orbital Earth',
    storyQuestion: 'Como levar uma solução de gestão de equipes ao mercado japonês quando o desafio é confiança?',
    metamorphosisFromTo: 'Mundo → Fio Vermelho (赤い糸) → Japão → 絆 Kizuna',
    narrativeNode: 'MUNDO',
    kanji: '絆',
    sceneCount: 4,
    sceneLabels: ['O Planeta', 'O Fio Vermelho (赤い糸)', 'Convergência no Japão', 'KIZUNA 絆']
  },
  {
    index: 1,
    code: '02',
    id: 'japao',
    shortTitle: 'POR QUE O JAPÃO?',
    fullTitle: '02 | POR QUE O JAPÃO? — Um mercado que exige contexto',
    bgThemeName: 'Archipelago & Data Lanterns',
    storyQuestion: 'Por que o Japão é uma grande oportunidade que exige compreensão de contexto?',
    metamorphosisFromTo: 'Globo → Tokyo, Osaka, Nagoya → Dados Reais → Ponte Brasil–Japão (1908)',
    narrativeNode: 'JAPÃO',
    kanji: '日',
    sceneCount: 3,
    sceneLabels: ['Dados do Mercado', 'Oportunidade Empresarial', 'Ponte Brasil ↔ Japão (1908)']
  },
  {
    index: 2,
    code: '03',
    id: 'choque-cultural',
    shortTitle: 'CHOQUE CULTURAL',
    fullTitle: '03 | O JAPÃO NÃO É APENAS OUTRO MERCADO',
    rBadge: 'R1 • CHOQUE CULTURAL',
    bgThemeName: 'Four Doors',
    storyQuestion: 'O que muda para uma empresa estrangeira ao entrar no Japão?',
    metamorphosisFromTo: 'Cultura → Idioma → Hábitos Empresariais → Regulação → Convergência',
    narrativeNode: 'PROBLEMA',
    kanji: '門',
    sceneCount: 5,
    sceneLabels: [
      'Porta 01: Cultura',
      'Porta 02: Idioma',
      'Porta 03: Hábitos',
      'Porta 04: Regulação',
      'Convergência das 4 Portas'
    ]
  },
  {
    index: 3,
    code: '04',
    id: 'global-local',
    shortTitle: 'GLOBAL × LOCAL',
    fullTitle: '04 | GLOBAL × LOCAL — Como conectar os dois?',
    bgThemeName: 'Rift & Hanko',
    storyQuestion: 'Como uma empresa global conquista um mercado que valoriza o contexto local?',
    metamorphosisFromTo: 'Capacidade Global × Contexto Local → Fio Vermelho → 絆 + Hanko',
    narrativeNode: 'CONEXÃO',
    kanji: '結',
    sceneCount: 3,
    sceneLabels: ['A Divisão Global × Local', 'Colisão de Fluxos', 'Conexão Kizuna 絆']
  },
  {
    index: 4,
    code: '05',
    id: 'kizuna-start',
    shortTitle: 'KIZUNA START',
    fullTitle: '05 | COMEÇAMOS PELA EQUIPE — Kizuna Start (¥980)',
    bgThemeName: 'Team Core',
    storyQuestion: 'Por onde o Kizuna começa a gerar valor sem complexidade desnecessária?',
    metamorphosisFromTo: 'Tarefas + Calendário + Projetos + Comunicação → Núcleo Kizuna',
    narrativeNode: 'KIZUNA',
    kanji: '始',
    sceneCount: 2,
    sceneLabels: ['Os 4 Blocos da Equipe', 'Núcleo Kizuna Start (¥980 税抜)']
  },
  {
    index: 5,
    code: '06',
    id: 'demonstracao',
    shortTitle: 'DEMONSTRAÇÃO',
    fullTitle: '06 | UMA INFORMAÇÃO. UMA OPERAÇÃO. — Demonstração ao Vivo',
    bgThemeName: 'Live Data Thread',
    storyQuestion: 'Como a informação nasce na equipe e chega à gestão sem sistemas desconectados?',
    metamorphosisFromTo: '1. Criar Tarefa → 2. Vincular ao Projeto → 3. Acompanhar → 4. Indicador → 5. Gestão',
    narrativeNode: 'PRODUTO',
    kanji: '動',
    sceneCount: 5,
    sceneLabels: [
      '1. Criar Tarefa',
      '2. Vincular ao Projeto',
      '3. Acompanhar Status',
      '4. Indicador (68% → 75%)',
      '5. Visão da Gestão'
    ]
  },
  {
    index: 6,
    code: '07',
    id: 'expansao',
    shortTitle: 'EXPANSÃO',
    fullTitle: '07 | À MEDIDA QUE A CONFIANÇA CRESCE, A PLATAFORMA CRESCE',
    bgThemeName: 'Land & Expand Rings',
    storyQuestion: 'Como evoluímos de gestão de equipes para uma plataforma empresarial completa?',
    metamorphosisFromTo: 'Start (¥980) → Business (¥1.980) → Enterprise (¥3.500)',
    narrativeNode: 'PRODUTO',
    kanji: '拡',
    sceneCount: 3,
    sceneLabels: ['Anel 1: Start (¥980)', 'Anel 2: Business (¥1.980)', 'Anel 3: Enterprise (¥3.500)']
  },
  {
    index: 7,
    code: '08',
    id: 'adaptacao',
    shortTitle: 'ADAPTAÇÃO',
    fullTitle: '08 | NÃO BASTA TRADUZIR — Adaptação ao Contexto Japonês',
    rBadge: 'R2 • ADAPTAÇÃO DO PRODUTO',
    bgThemeName: 'Kintsugi & Ringi',
    storyQuestion: 'Como o Kizuna se adapta à língua, UX, Ringi, Nemawashi, integrações e compliance?',
    metamorphosisFromTo: '01 Nome → 02 Idioma → 03 UX → 04 Ringi & Nemawashi → 05 Integrações → 06 Compliance',
    narrativeNode: 'ADAPTAÇÃO',
    kanji: '和',
    sceneCount: 3,
    sceneLabels: ['Identidade, Idioma & UX', 'Processos: Ringi & Nemawashi', 'Integrações & Compliance']
  },
  {
    index: 8,
    code: '09',
    id: 'confianca-governanca',
    shortTitle: 'GOVERNANÇA & IA',
    fullTitle: '09 | A CONFIANÇA PRECISA ESTAR NO PRODUTO — IA não decide sozinha',
    bgThemeName: 'Red Validation Gate',
    storyQuestion: 'Como combinamos IA e automação com validação humana e rastreabilidade?',
    metamorphosisFromTo: 'IA Propõe → Portão de Validação Humana → Execução → Audit Trail',
    narrativeNode: 'CONFIANÇA',
    kanji: '守',
    sceneCount: 3,
    sceneLabels: ['RBAC, Audit Trail & Governança', 'Portão de Validação Humana', 'Execução & Registro']
  },
  {
    index: 9,
    code: '10',
    id: 'praca-entrada',
    shortTitle: 'PRAÇA & ENTRADA',
    fullTitle: '10 | COMO CHEGAMOS AO CLIENTE? — Canais & Modo de Entrada',
    rBadge: 'R3 • PRAÇA',
    bgThemeName: 'Archipelago Route',
    storyQuestion: 'Quais canais utilizamos e como entramos no Japão reduzindo o risco?',
    metamorphosisFromTo: 'Parceiro Local → Pilotos → Referência → Escala → Presença Própria (株式会社)',
    narrativeNode: 'MERCADO',
    kanji: '道',
    sceneCount: 2,
    sceneLabels: ['Os 5 Canais de Acesso', 'As 5 Fases do Modo de Entrada']
  },
  {
    index: 10,
    code: '11',
    id: 'promocao',
    shortTitle: 'PROMOÇÃO',
    fullTitle: '11 | COMO O KIZUNA SE TORNA CONHECIDO? — Global Reach. Local Trust.',
    rBadge: 'R4 • PROMOÇÃO',
    bgThemeName: 'Tokyo Media & Proof',
    storyQuestion: 'Como construímos reconhecimento de marca, autoridade e prova social no Japão?',
    metamorphosisFromTo: 'Global Reach. Local Trust. → 7 Canais B2B → Peças em Tóquio & Prova Social',
    narrativeNode: 'MERCADO',
    kanji: '伝',
    sceneCount: 3,
    sceneLabels: ['Mensagem & Público-Alvo', '7 Canais & Ecossistema Tóquio', 'Prova Social & Credibilidade']
  },
  {
    index: 11,
    code: '12',
    id: 'posicionamento',
    shortTitle: 'POSICIONAMENTO',
    fullTitle: '12 | SE O JAPÃO JÁ POSSUI SOLUÇÕES, POR QUE ESCOLHER O KIZUNA?',
    bgThemeName: 'Strategic 2x2 Matrix',
    storyQuestion: 'Qual é o diferencial estratégico do Kizuna diante das opções globais e locais?',
    metamorphosisFromTo: 'Global Capability × Local Adaptation → Matriz 2×2 → 5 Diferenciais',
    narrativeNode: 'NEGÓCIO',
    kanji: '位',
    sceneCount: 2,
    sceneLabels: ['Global Capability × Local Adaptation', 'Mapa 2×2 & Diferenciais Propostos']
  },
  {
    index: 12,
    code: '13',
    id: 'preco',
    shortTitle: 'PREÇO & VALOR',
    fullTitle: '13 | COMO O KIZUNA GERA VALOR? — Planos (税抜) & Simulador',
    bgThemeName: 'Revenue Architecture',
    storyQuestion: 'Como funciona a assinatura por usuário (税抜) e a separação de implantação e integrações?',
    metamorphosisFromTo: 'Start (¥980) | Business (¥1.980) | Enterprise (¥3.500) → Simulador 10 → 40 → 100',
    narrativeNode: 'NEGÓCIO',
    kanji: '価',
    sceneCount: 2,
    sceneLabels: ['3 Planos (¥980 • ¥1.980 • ¥3.500 税抜)', 'Simulador (10 → 40 → 100) + Licenças / Implantação / Integrações']
  },
  {
    index: 13,
    code: '14',
    id: 'riscos-indicadores',
    shortTitle: 'RISCOS & KPIs',
    fullTitle: '14 | UMA ESTRATÉGIA PRECISA SER MEDIDA — Riscos & Indicadores',
    bgThemeName: 'Risk & Telemetry',
    storyQuestion: 'Como mitigamos os 4 riscos principais e quais KPIs medem o sucesso?',
    metamorphosisFromTo: '4 Riscos & Respostas → KPIs de Mercado, Produto e Negócio (MRR)',
    narrativeNode: 'NEGÓCIO',
    kanji: '標',
    sceneCount: 2,
    sceneLabels: ['Os 4 Riscos & Respostas Estratégicas', 'Painel de KPIs: Mercado, Produto e Negócio']
  },
  {
    index: 14,
    code: '15',
    id: 'encerramento',
    shortTitle: 'ENCERRAMENTO',
    fullTitle: '15 | 絆 KIZUNA — Global Reach. Local Trust.',
    bgThemeName: 'Full Circle Red Thread',
    storyQuestion: 'Qual é a síntese que permanece após percorrer todo o caminho?',
    metamorphosisFromTo: 'Brasil → Mundo → Japão → Equipes → Empresas → Kizuna (絆)',
    narrativeNode: 'FUTURO',
    kanji: '絆',
    sceneCount: 3,
    sceneLabels: ['O Fio Fecha o Círculo', 'Brasil → Mundo → Japão → Kizuna', '絆 GLOBAL REACH. LOCAL TRUST.']
  }
];

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
  setBackupVideoMode: (open: boolean) => void;
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [commandCue, setCommandCue] = useState<CommandCue | null>(null);
  const cueTimerRef = useRef<number | null>(null);

  const totalSections = PRESENTATION_SECTIONS.length;
  const currentSection = PRESENTATION_SECTIONS[currentIndex];
  const sectionKey = currentSection.code as keyof typeof sourcesData.sections;
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
      setCurrentIndex(index);
      setSceneIndexState(clampedScene);
      setNavMenuOpen(false);
    },
    [totalSections]
  );

  const setSceneIndex = useCallback(
    (sceneIdx: number) => {
      const clamped = Math.max(0, Math.min(currentSection.sceneCount - 1, sceneIdx));
      setSceneIndexState(clamped);
    },
    [currentSection.sceneCount]
  );

  const nextStep = useCallback(() => {
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
    if (currentIndex < totalSections - 1) {
      const nextSec = PRESENTATION_SECTIONS[currentIndex + 1];
      setCurrentIndex((prev) => prev + 1);
      setSceneIndexState(0);
      triggerCue('TELA', `${nextSec.code} • ${nextSec.shortTitle}`);
    }
  }, [currentIndex, totalSections, triggerCue]);

  const prevSection = useCallback(() => {
    if (currentIndex > 0) {
      const prevSec = PRESENTATION_SECTIONS[currentIndex - 1];
      setCurrentIndex((prev) => prev - 1);
      setSceneIndexState(0);
      triggerCue('TELA', `${prevSec.code} • ${prevSec.shortTitle}`);
    }
  }, [currentIndex, triggerCue]);

  const resetCurrentScene = useCallback(() => {
    setSceneIndexState(0);
    triggerCue('RESET', `TELA ${currentSection.code} • CENA 1/${currentSection.sceneCount}`);
  }, [currentSection, triggerCue]);

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

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (tag !== 'BUTTON') {
          e.preventDefault();
          nextStep();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggleStageMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSafeMode();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setBackupVideoMode((prev) => !prev);
        triggerCue('VÍDEO DE RESERVA', 'Simulação Contínua de Emergência');
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
    backupVideoMode,
    evidenceOpen,
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
        setBackupVideoMode,
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
