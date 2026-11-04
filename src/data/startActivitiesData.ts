import { ActivityRecord, ProjectRecord, TeamId, TeamMember } from '../types/erp';

/**
 * Kizuna Start — dados FICTÍCIOS de demonstração.
 * Nomes, equipes, projetos e datas são exemplos; não representam clientes, pessoas ou resultados reais.
 */

/** Data de referência fixa da demonstração (evita que "atrasado" mude com o relógio). */
export const DEMO_TODAY = '2026-10-21';

export const TEAM_LABELS: Record<TeamId, { jp: string; en: string; pt: string }> = {
  OPERACOES: { jp: '業務チーム', en: 'Operations', pt: 'Operações' },
  COMERCIAL: { jp: '営業チーム', en: 'Sales', pt: 'Comercial' },
  ATENDIMENTO: { jp: 'サポートチーム', en: 'Support', pt: 'Atendimento' },
};

export const TEAM_ORDER: TeamId[] = ['OPERACOES', 'COMERCIAL', 'ATENDIMENTO'];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'MBR-01', nameJp: '佐藤 美咲', nameRomaji: 'Misaki Sato', team: 'OPERACOES' },
  { id: 'MBR-02', nameJp: '鈴木 健二', nameRomaji: 'Kenji Suzuki', team: 'OPERACOES' },
  { id: 'MBR-03', nameJp: '田中 彩', nameRomaji: 'Aya Tanaka', team: 'COMERCIAL' },
  { id: 'MBR-04', nameJp: '伊藤 蓮', nameRomaji: 'Ren Ito', team: 'COMERCIAL' },
  { id: 'MBR-05', nameJp: '小林 優', nameRomaji: 'Yu Kobayashi', team: 'ATENDIMENTO' },
  { id: 'MBR-06', nameJp: '山田 太郎', nameRomaji: 'Taro Yamada', team: 'ATENDIMENTO' },
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  { id: 'PRJ-001', name: 'Rotina semanal da equipe', nameJp: '週次ルーティン', teamId: 'OPERACOES' },
  { id: 'PRJ-002', name: 'Acompanhamento de clientes (exemplo)', nameJp: '顧客フォロー (例)', teamId: 'COMERCIAL' },
  { id: 'PRJ-003', name: 'Fila de atendimento', nameJp: '問い合わせ対応', teamId: 'ATENDIMENTO' },
];

export const INITIAL_ACTIVITIES: ActivityRecord[] = [
  { id: 'ATV-0001', title: 'Revisar escala da semana', assigneeId: 'MBR-01', dueDate: '2026-10-19', status: 'DOING', projectId: 'PRJ-001', createdAt: '2026-10-12' },
  { id: 'ATV-0002', title: 'Atualizar checklist de abertura', assigneeId: 'MBR-02', dueDate: '2026-10-23', status: 'TODO', projectId: 'PRJ-001', createdAt: '2026-10-14' },
  { id: 'ATV-0003', title: 'Registrar pendências da reunião semanal', assigneeId: 'MBR-01', dueDate: '2026-10-16', status: 'DONE', projectId: 'PRJ-001', createdAt: '2026-10-09', completedAt: '2026-10-16' },
  { id: 'ATV-0004', title: 'Organizar a pasta de documentos da equipe', assigneeId: 'MBR-02', dueDate: '2026-10-28', status: 'TODO', projectId: null, createdAt: '2026-10-15' },
  { id: 'ATV-0005', title: 'Preparar lista de contatos para retorno', assigneeId: 'MBR-03', dueDate: '2026-10-20', status: 'DOING', projectId: 'PRJ-002', createdAt: '2026-10-13' },
  { id: 'ATV-0006', title: 'Enviar resumo da conversa ao responsável', assigneeId: 'MBR-04', dueDate: '2026-10-22', status: 'TODO', projectId: 'PRJ-002', createdAt: '2026-10-16' },
  { id: 'ATV-0007', title: 'Atualizar status dos contatos em aberto', assigneeId: 'MBR-03', dueDate: '2026-10-14', status: 'DONE', projectId: 'PRJ-002', createdAt: '2026-10-07', completedAt: '2026-10-13' },
  { id: 'ATV-0008', title: 'Agendar retorno com contato prioritário', assigneeId: 'MBR-04', dueDate: '2026-10-18', status: 'TODO', projectId: 'PRJ-002', createdAt: '2026-10-12' },
  { id: 'ATV-0009', title: 'Classificar solicitações da fila por urgência', assigneeId: 'MBR-05', dueDate: '2026-10-21', status: 'DOING', projectId: 'PRJ-003', createdAt: '2026-10-19' },
  { id: 'ATV-0010', title: 'Responder solicitações pendentes há mais de 2 dias', assigneeId: 'MBR-06', dueDate: '2026-10-17', status: 'TODO', projectId: 'PRJ-003', createdAt: '2026-10-10' },
  { id: 'ATV-0011', title: 'Atualizar respostas padrão da equipe', assigneeId: 'MBR-05', dueDate: '2026-10-26', status: 'TODO', projectId: 'PRJ-003', createdAt: '2026-10-18' },
  { id: 'ATV-0012', title: 'Registrar ocorrências do dia', assigneeId: 'MBR-06', dueDate: '2026-10-15', status: 'DONE', projectId: 'PRJ-003', createdAt: '2026-10-14', completedAt: '2026-10-15' },
];
