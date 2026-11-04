import React from 'react';
import { RelatedRecordRef, RecordType } from '../../types/erp';
import { useKizuna } from '../../context/KizunaContext';
import {
  FileText,
  Building2,
  ShoppingCart,
  Receipt,
  BookOpen,
  CreditCard,
  Package,
  ArrowUpRight,
  GitPullRequest,
} from 'lucide-react';

interface RelatedRecordsBarProps {
  records: RelatedRecordRef[];
  titleJp?: string;
  compact?: boolean;
}

const typeMeta: Record<
  RecordType,
  { badgeJp: string; badgeEn: string; badgePt: string; icon: React.FC<{ className?: string }> }
> = {
  PARTNER: { badgeJp: '取引先', badgeEn: 'Partner', badgePt: 'Parceiro', icon: Building2 },
  SO: { badgeJp: '受注', badgeEn: 'Sales Order', badgePt: 'Pedido Venda', icon: ShoppingCart },
  INV: { badgeJp: '請求書', badgeEn: 'Invoice', badgePt: 'Fatura', icon: Receipt },
  CONTRACT: { badgeJp: '契約書', badgeEn: 'Contract', badgePt: 'Contrato', icon: FileText },
  PAYMENT: { badgeJp: '入金/支払', badgeEn: 'Payment', badgePt: 'Pagamento', icon: CreditCard },
  JE: { badgeJp: '仕訳伝票', badgeEn: 'Journal Entry', badgePt: 'Lançamento', icon: BookOpen },
  PR: { badgeJp: '購買稟議', badgeEn: 'Purchase Req', badgePt: 'Req. Compra', icon: GitPullRequest },
  PO: { badgeJp: '発注書', badgeEn: 'Purchase Order', badgePt: 'Pedido Compra', icon: ShoppingCart },
  ITEM: { badgeJp: '在庫品目', badgeEn: 'Inventory', badgePt: 'Item Estoque', icon: Package },
  DOC: { badgeJp: '文書', badgeEn: 'Document', badgePt: 'Documento', icon: FileText },
  EMP: { badgeJp: '社員', badgeEn: 'Employee', badgePt: 'Funcionário', icon: Building2 },
};

export const RelatedRecordsBar: React.FC<RelatedRecordsBarProps> = ({
  records,
  titleJp = '関連情報・紐付レコード',
  compact = false,
}) => {
  const { openRecord, t, subLang } = useKizuna();

  if (!records.length) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
          <span className="text-xs font-semibold text-slate-800 tracking-wide">
            {titleJp}
          </span>
          <span className="text-[11px] text-slate-500">
            / {t('Related Records (Kizuna Graph)', 'Registros Relacionados (Grafo Kizuna)')}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {records.length} {t('LINKED ENTITIES', 'VÍNCULOS ATIVOS')}
        </span>
      </div>

      <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}>
        {records.map((rec, index) => {
          const meta = typeMeta[rec.type] || typeMeta.DOC;
          const Icon = meta.icon;
          const statusText =
            subLang === 'EN' ? rec.statusEn || rec.statusJp : rec.statusPt || rec.statusJp;
          const titleSub = subLang === 'EN' ? rec.titleEn : rec.titlePt;

          return (
            <button
              key={`${rec.type}-${rec.id}-${index}`}
              onClick={() => openRecord(rec.type, rec.id)}
              className="group flex items-center justify-between gap-3 px-3 py-2 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 rounded text-left transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded bg-slate-100 group-hover:bg-blue-100/80 text-slate-600 group-hover:text-blue-800 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {meta.badgeJp}
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-900 group-hover:underline truncate">
                      {rec.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 truncate mt-0.5">
                    <span className="font-medium">{rec.titleJp}</span>
                    {titleSub && <span className="text-slate-400 ml-1">({titleSub})</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rec.amount !== undefined && (
                  <span className="text-xs font-mono font-medium text-slate-800 tabular-nums">
                    ¥{rec.amount.toLocaleString()}
                  </span>
                )}
                {rec.statusJp && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                    title={statusText}
                  >
                    {rec.statusJp}
                  </span>
                )}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
