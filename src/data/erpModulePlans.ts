import { ModuleId } from '../types/erp';

export type ErpPlanTag = 'START' | 'BUSINESS' | 'ENTERPRISE' | 'EXPANSION';

/**
 * Plano ao qual cada módulo da demonstração pertence (alinhado a pricing.json / tela 07).
 * EXPANSION = módulo demonstrativo de visão de expansão, fora do portfólio comercial dos planos.
 */
export const MODULE_PLAN: Record<ModuleId, ErpPlanTag> = {
  activities: 'START',
  workflow: 'BUSINESS',
  documents: 'BUSINESS',
  dashboard: 'BUSINESS',
  ai: 'BUSINESS',
  audit: 'ENTERPRISE',
  compliance: 'ENTERPRISE',
  analytics: 'ENTERPRISE',
  accounting: 'EXPANSION',
  sales: 'EXPANSION',
  procurement: 'EXPANSION',
  inventory: 'EXPANSION',
  partners: 'EXPANSION',
  hr: 'EXPANSION',
  production: 'EXPANSION',
};

export const PLAN_TAG_LABEL: Record<ErpPlanTag, string> = {
  START: 'START',
  BUSINESS: 'BUSINESS',
  ENTERPRISE: 'ENTERPRISE',
  EXPANSION: 'DEMO',
};

export const PLAN_TAG_CLASS: Record<ErpPlanTag, string> = {
  START: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  BUSINESS: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  ENTERPRISE: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  EXPANSION: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
};

export const PLAN_CONTEXT_NOTE: Record<ErpPlanTag, { pt: string; en: string; cls: string }> = {
  START: {
    pt: 'Kizuna Start • gestão de equipes e atividades',
    en: 'Kizuna Start • team and activity management',
    cls: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  },
  BUSINESS: {
    pt: 'Recurso do Kizuna Business (expansão) — não faz parte do Kizuna Start',
    en: 'Kizuna Business feature (expansion) — not part of Kizuna Start',
    cls: 'bg-sky-50 border-sky-300 text-sky-900',
  },
  ENTERPRISE: {
    pt: 'Recurso do Kizuna Enterprise (expansão avançada) — não faz parte do Kizuna Start',
    en: 'Kizuna Enterprise feature (advanced expansion) — not part of Kizuna Start',
    cls: 'bg-violet-50 border-violet-300 text-violet-900',
  },
  EXPANSION: {
    pt: 'Módulo demonstrativo de visão de expansão — NÃO disponível nos planos atuais e não é funcionalidade validada',
    en: 'Expansion-vision demo module — NOT available in current plans and not a validated feature',
    cls: 'bg-amber-50 border-amber-400 text-amber-950',
  },
};
