import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  X,
  TrendingUp,
  Building2,
  Receipt,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const ArDrilldownModal: React.FC = () => {
  const {
    isArDrilldownOpen,
    setIsArDrilldownOpen,
    kpis,
    openRecord,
    t,
  } = useKizuna();

  if (!isArDrilldownOpen) return null;

  const breakdown = [
    {
      partnerId: 'PTN-001',
      nameJp: '株式会社山田',
      nameEn: 'Yamada Corporation',
      orderId: 'SO-2026-10482',
      invoiceId: 'INV-2026-00389',
      jeId: 'JE-2026-02841',
      amount: 8420000,
      sharePct: 66.3,
      deltaText: '+¥8.42M (当月大口計上)',
      dueDate: '2026年11月30日',
      statusJp: '承認済・売掛計上',
      isPrimaryDriver: true,
    },
    {
      partnerId: 'PTN-003',
      nameJp: '株式会社 Kizuna Trading',
      nameEn: 'Kizuna Trading Co., Ltd.',
      orderId: 'SO-2026-10475',
      invoiceId: 'INV-2026-00376',
      jeId: 'JE-2026-02835',
      amount: 2480000,
      sharePct: 19.5,
      deltaText: '+¥2.48M (出荷検収分)',
      dueDate: '2026年11月30日',
      statusJp: '会計未連携',
      isPrimaryDriver: false,
    },
    {
      partnerId: 'PTN-004',
      nameJp: '関西精密工業株式会社',
      nameEn: 'Kansai Precision Industries Ltd.',
      orderId: 'SO-2026-10460',
      invoiceId: 'INV-2026-00362',
      jeId: 'JE-2026-02830',
      amount: 1800000,
      sharePct: 14.2,
      deltaText: '+¥1.80M (定期納入)',
      dueDate: '2026年11月15日',
      statusJp: '売掛計上済',
      isPrimaryDriver: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-300 font-mono uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>売掛債権 変動要因ドリルダウン / {t('Accounts Receivable Variance Drill-Down', 'Análise de Variação do Contas a Receber')}</span>
            </div>
            <h3 className="text-lg font-bold mt-0.5 flex items-center gap-3">
              <span>未回収債権 (Accounts Receivable): ¥{(kpis.accountsReceivable / 1000000).toFixed(2)}M</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono">
                ↑ 14.2% MoM
              </span>
            </h3>
          </div>
          <button
            onClick={() => setIsArDrilldownOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Root-Cause Banner */}
        <div className="px-6 py-3.5 bg-blue-50/90 border-b border-blue-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-800 leading-relaxed">
            <strong className="font-semibold text-blue-950">
              経営分析インサイト / {t('Executive Root-Cause Analysis:', 'Diagnóstico para a Diretoria:')}
            </strong>{' '}
            {t(
              '66.3% of the current Accounts Receivable balance (¥8,420,000) originates from Yamada Corporation (株式会社山田) under Order #SO-2026-10482 / Invoice #INV-2026-00389. Click any entity below to trace back to the source transaction.',
              '66,3% do saldo atual de Contas a Receber (¥8.420.000) refere-se à Yamada Corporation (株式会社山田), originado no Pedido #SO-2026-10482 e Fatura #INV-2026-00389. Clique em qualquer registro abaixo para rastrear até a transação original.'
            )}
          </div>
        </div>

        {/* Customer Breakdown List */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            取引先別 売掛金内訳 / {t('Receivables by Business Partner', 'Composição por Cliente')}
          </div>

          {breakdown.map((row) => (
            <div
              key={row.partnerId}
              className={`p-4 rounded-md border transition-all ${
                row.isPrimaryDriver
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {row.isPrimaryDriver && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900 text-white">
                        主要増加要因 / {t('TOP DRIVER', 'PRINCIPAL FATOR')}
                      </span>
                    )}
                    <button
                      onClick={() => openRecord('PARTNER', row.partnerId)}
                      className="text-base font-bold text-slate-900 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                    >
                      <Building2 className="w-4 h-4 text-blue-800" />
                      <span>{row.nameJp}</span>
                      <span className="text-xs font-normal text-slate-500">({row.nameEn})</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>回収期日: {row.dueDate}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{row.deltaText}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    ¥{row.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    構成比 {row.sharePct}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3 mb-3">
                <div
                  className={`h-full rounded-full ${
                    row.isPrimaryDriver ? 'bg-blue-700' : 'bg-slate-400'
                  }`}
                  style={{ width: `${row.sharePct}%` }}
                />
              </div>

              {/* Direct Traceability Links */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openRecord('PARTNER', row.partnerId)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-blue-900 text-white font-medium flex items-center gap-1 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>顧客 360° ({row.nameJp})</span>
                  </button>
                  <button
                    onClick={() => openRecord('SO', row.orderId)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono flex items-center gap-1"
                  >
                    <span>注文 {row.orderId}</span>
                  </button>
                  <button
                    onClick={() => openRecord('INV', row.invoiceId)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono flex items-center gap-1"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-700" />
                    <span>請求 {row.invoiceId}</span>
                  </button>
                  <button
                    onClick={() => openRecord('JE', row.jeId)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>仕訳 {row.jeId}</span>
                  </button>
                </div>

                <button
                  onClick={() => openRecord('PARTNER', row.partnerId)}
                  className="text-blue-800 hover:text-blue-950 font-semibold flex items-center gap-1"
                >
                  <span>{t('Trace Transaction →', 'Rastrear Transação →')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
