import pricingData from './pricing.json';

// Fonte única dos preços e regras comerciais do projeto (pricing.json).
// Os valores são PROPOSTAS ACADÊMICAS, não preços oficiais da Globant.

export type PlanId = 'start' | 'business' | 'enterprise';

export const PRICING = pricingData;

export const getPlan = (id: PlanId) => {
  const plan = pricingData.plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Plano desconhecido: ${id}`);
  return plan;
};

/** Formata ienes no padrão usado nos textos do projeto (ex.: ¥1.980). */
export const yen = (n: number): string => `¥${n.toLocaleString('pt-BR')}`;

/** Escalas de usuários usadas na narrativa do simulador (ex.: 10 → 40 → 100). */
export const scaleStory = pricingData.plans.map((p) => p.users.default).join(' → ');

/** Plano sugerido para uma quantidade de usuários (faixas definidas em pricing.json). */
export const planForUsers = (count: number): PlanId => {
  if (count <= getPlan('start').users.max!) return 'start';
  if (count <= getPlan('business').users.max!) return 'business';
  return 'enterprise';
};
