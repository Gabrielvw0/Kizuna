import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { ModuleId } from '../../types/erp';
import { MODULE_PLAN, PLAN_TAG_CLASS, PLAN_TAG_LABEL } from '../../data/erpModulePlans';
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  ShoppingCart,
  Package,
  Briefcase,
  Building2,
  FileText,
  GitPullRequest,
  ShieldCheck,
  Activity,
  Users,
  Factory,
  Sparkles,
  ListChecks,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  id: ModuleId;
  labelJp: string;
  labelEn: string;
  labelPt: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'amber' | 'red';
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, kpis, subLang, t } = useKizuna();
  const [expansionOpen, setExpansionOpen] = useState(false);

  const sections: { titleJp: string; titleSub: string; items: NavItem[] }[] = [
    {
      titleJp: '経営・意思決定',
      titleSub: t('Executive & BI', 'Executivo & BI'),
      items: [
        {
          id: 'dashboard',
          labelJp: '経営ダッシュボード',
          labelEn: 'Executive Dashboard',
          labelPt: 'Dashboard Executivo',
          icon: LayoutDashboard,
        },
        {
          id: 'analytics',
          labelJp: '経営分析 (BI)',
          labelEn: 'Management Analytics',
          labelPt: 'Business Intelligence',
          icon: BarChart3,
        },
        {
          id: 'ai',
          labelJp: 'Kizuna AI 参謀',
          labelEn: 'Kizuna Intelligence',
          labelPt: 'Inteligência Artificial',
          icon: Sparkles,
          badge: 'AI',
          badgeType: 'amber',
        },
      ],
    },
    {
      titleJp: '基幹業務・SCM',
      titleSub: t('Core Operations & SCM', 'Operações & SCM'),
      items: [
        {
          id: 'accounting',
          labelJp: '会計管理',
          labelEn: 'Accounting & Finance',
          labelPt: 'Contabilidade & Finanças',
          icon: BookOpen,
        },
        {
          id: 'sales',
          labelJp: '販売管理',
          labelEn: 'Sales Management',
          labelPt: 'Gestão de Vendas',
          icon: Briefcase,
        },
        {
          id: 'procurement',
          labelJp: '購買管理',
          labelEn: 'Procurement',
          labelPt: 'Gestão de Compras',
          icon: ShoppingCart,
        },
        {
          id: 'inventory',
          labelJp: '在庫管理',
          labelEn: 'Inventory Control',
          labelPt: 'Controle de Estoque',
          icon: Package,
          badge: kpis.lowStockCount > 0 ? kpis.lowStockCount : undefined,
          badgeType: 'red',
        },
        {
          id: 'partners',
          labelJp: '取引先管理',
          labelEn: 'Business Partners',
          labelPt: 'Clientes & Fornecedores',
          icon: Building2,
        },
      ],
    },
    {
      titleJp: '統制・文書・ワークフロー',
      titleSub: t('Governance & Workflow', 'Governança & Fluxos'),
      items: [
        {
          id: 'workflow',
          labelJp: 'ワークフロー (稟議)',
          labelEn: 'Workflow & Ringi',
          labelPt: 'Workflow & Aprovações',
          icon: GitPullRequest,
          badge: kpis.pendingApprovalsCount > 0 ? kpis.pendingApprovalsCount : undefined,
          badgeType: 'amber',
        },
        {
          id: 'documents',
          labelJp: '文書管理',
          labelEn: 'Document Management',
          labelPt: 'Gestão de Documentos',
          icon: FileText,
        },
        {
          id: 'compliance',
          labelJp: 'コンプライアンス',
          labelEn: 'Japanese Compliance',
          labelPt: 'Compliance Japonês',
          icon: ShieldCheck,
        },
        {
          id: 'audit',
          labelJp: '監査ログ',
          labelEn: 'Audit Log',
          labelPt: 'Trilha de Auditoria',
          icon: Activity,
        },
      ],
    },
    {
      titleJp: '人的資本・生産技術',
      titleSub: t('HR & Manufacturing', 'RH & Manufatura'),
      items: [
        {
          id: 'hr',
          labelJp: '人事管理',
          labelEn: 'Human Resources',
          labelPt: 'Recursos Humanos',
          icon: Users,
        },
        {
          id: 'production',
          labelJp: '生産管理 (BOM)',
          labelEn: 'Production & BOM',
          labelPt: 'Produção & BOM',
          icon: Factory,
        },
      ],
    },
  ];

  const allItems = sections.flatMap((sec) => sec.items);
  const pick = (ids: ModuleId[]) =>
    ids.map((id) => allItems.find((i) => i.id === id)).filter((i): i is NavItem => !!i);
  const activityItem: NavItem = {
    id: 'activities',
    labelJp: 'アクティビティ管理',
    labelEn: 'Team & Activity Management',
    labelPt: 'Equipes e Atividades',
    icon: ListChecks,
  };

  const groups: {
    key: string;
    titleJp: string;
    titleSub: string;
    items: NavItem[];
    collapsible?: boolean;
  }[] = [
    { key: 'START', titleJp: 'KIZUNA START', titleSub: t('Core experience', 'Experiência principal'), items: [activityItem] },
    {
      key: 'BUSINESS',
      titleJp: 'KIZUNA BUSINESS',
      titleSub: t('Expansion', 'Expansão'),
      items: pick(['workflow', 'documents', 'dashboard', 'ai']),
    },
    {
      key: 'ENTERPRISE',
      titleJp: 'KIZUNA ENTERPRISE',
      titleSub: t('Advanced expansion', 'Expansão avançada'),
      items: pick(['audit', 'compliance', 'analytics']),
    },
    {
      key: 'EXPANSION',
      titleJp: t('EXPANSION VISION • DEMO', 'VISÃO DE EXPANSÃO • DEMO'),
      titleSub: t('Not in Start', 'Fora do Start'),
      items: pick(['accounting', 'sales', 'procurement', 'inventory', 'partners', 'hr', 'production']),
      collapsible: true,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Corporate Brand Header */}
      <div className="h-14 px-4 border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-serif font-bold text-base tracking-tighter shadow-inner border border-blue-500/40">
            絆
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-wider text-white">KIZUNA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/15 text-amber-300 rounded border border-amber-500/40">
                DEMO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight">
              {t('Demonstration environment', 'Ambiente de demonstração')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {groups.map((grp) => {
          const hasActive = grp.items.some((i) => i.id === activeModule);
          const open = !grp.collapsible || expansionOpen || hasActive;
          return (
            <div key={grp.key} className="space-y-1">
              {grp.collapsible ? (
                <button
                  onClick={() => setExpansionOpen((v) => !v)}
                  className="w-full px-2.5 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 hover:text-amber-300"
                  aria-expanded={open}
                >
                  <span>
                    {grp.titleJp} ({grp.items.length})
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  <span>{grp.titleJp}</span>
                  <span className="text-[9px] text-slate-600">{grp.titleSub}</span>
                </div>
              )}

              {open &&
                grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  const subLabel = subLang === 'EN' ? item.labelEn : item.labelPt;
                  const plan = MODULE_PLAN[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-all group ${
                        isActive
                          ? 'bg-blue-950/90 text-white border-l-2 border-blue-400 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <div className="min-w-0 leading-tight">
                          <div
                            className={`text-xs truncate ${
                              isActive ? 'font-semibold text-white' : 'font-medium text-slate-300'
                            }`}
                          >
                            {item.labelJp}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">{subLabel}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              item.badgeType === 'red'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span
                          className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded border ${PLAN_TAG_CLASS[plan]}`}
                        >
                          {PLAN_TAG_LABEL[plan]}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Informational status (no fake metrics) */}
      <div className="p-3 pb-14 border-t border-slate-800/80 bg-slate-950/60 text-[10px] space-y-1">
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{t('DEMO • FICTITIOUS DATA', 'DEMO • DADOS FICTÍCIOS')}</span>
        </div>
        <div className="text-slate-500 leading-snug">
          {t('No real integrations. Not a production system.', 'Sem integrações reais. Não é um sistema em produção.')}
        </div>
      </div>
    </aside>
  );
};
