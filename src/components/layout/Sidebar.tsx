import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { ModuleId } from '../../types/erp';
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
  const { activeModule, setActiveModule, kpis, subLang, recordCustomAction, t } = useKizuna();

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
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-blue-300 rounded border border-slate-700">
                ERP v9.4
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight">
              統合基幹業務システム
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>{sec.titleJp}</span>
              <span className="text-[9px] text-slate-600">{sec.titleSub}</span>
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              const subLabel = subLang === 'EN' ? item.labelEn : item.labelPt;

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
                        isActive
                          ? 'text-blue-400'
                          : 'text-slate-500 group-hover:text-slate-300'
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
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {subLabel}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        item.badgeType === 'red'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom System Status */}
      <button
        onClick={() =>
          recordCustomAction(
            '基幹データベース・クラスター同期確認',
            '東京・大阪・名古屋・福岡 全4拠点レプリケーション遅延 0.4ms (正常)',
            'DB-CLUSTER-01',
            '99.98% ONLINE'
          )
        }
        className="w-full text-left p-3 border-t border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 transition-colors text-[11px] space-y-1.5"
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>基幹DB稼働状態 (Click)</span>
          </span>
          <span className="font-mono text-emerald-400">99.98% ONLINE</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono truncate">
          会計年度: 2026年度 (第3四半期)
        </div>
      </button>
    </aside>
  );
};
