import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from '../shared/HankoStamp';
import { RelatedRecordsBar } from '../shared/RelatedRecordsBar';
import {
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Building2,
} from 'lucide-react';

export const ProcurementModule: React.FC = () => {
  const {
    purchaseRequests,
    selectedPrId,
    setSelectedPrId,
    approvePurchaseRequest,
    openRecord,
    kpis,
    t,
  } = useKizuna();

  const activePr =
    purchaseRequests.find((p) => p.id === selectedPrId) || purchaseRequests[0];

  const flowSteps = [
    { jp: '申請', sub: t('Request', 'Solicitação') },
    { jp: '見積', sub: t('Quotation', 'Cotação') },
    { jp: '承認', sub: t('Approval', 'Aprovação') },
    { jp: '発注', sub: t('PO Dispatch', 'Pedido') },
    { jp: '入荷', sub: t('Receipt', 'Recebimento') },
    { jp: '請求照合', sub: t('3-Way Match', 'Fatura') },
    { jp: '支払', sub: t('Payment', 'Pagamento') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            購買依頼・相見積・稟議決裁・EDI発注・入荷検収・買掛金連携
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>購買管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Procurement & Source-to-Pay', 'Gestão de Compras & Suprimentos')}
            </span>
          </h1>
        </div>

        {/* End-to-End Procurement Flow */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white px-3.5 py-2 rounded-md border border-slate-200 shadow-sm text-xs">
          {flowSteps.map((st, idx) => (
            <React.Fragment key={st.jp}>
              <div className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                {st.jp}{' '}
                <span className="text-[10px] font-normal text-slate-400">({st.sub})</span>
              </div>
              {idx < flowSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Split View: Left PR List, Right Selected PR Vertical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Purchase Requests List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-blue-800" />
              <span>発注依頼一覧 / {t('Purchase Requests', 'Solicitações de Compra')}</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              当月発注: {kpis.activePoCount}件
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {purchaseRequests.map((pr) => {
              const isSelected = pr.id === activePr.id;
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  className={`w-full p-4 text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-900'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-blue-900">
                      {pr.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        pr.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {pr.statusJp}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {pr.supplierNameJp}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                    {pr.titleJp}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      申請者: <strong>{pr.requesterJp}</strong> ({pr.departmentJp})
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ¥{pr.amount.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Purchase Request Detail & Vertical Approval Timeline */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  発注依頼 | Purchase Request
                </span>
                <span className="text-sm font-mono font-bold text-blue-900">
                  {activePr.id}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                {activePr.titleJp}
              </h3>
              <p className="text-xs text-slate-500">
                {t(activePr.titleEn, activePr.titlePt)}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">発注金額 (税抜)</div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                ¥ {activePr.amount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Structured Key-Value Grid (Exact match to prompt specification) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400">申請者 / {t('Requester', 'Solicitante')}</div>
              <div className="font-bold text-slate-900 mt-0.5">{activePr.requesterJp}</div>
              <div className="text-[10px] text-slate-500">{activePr.requesterRomaji}</div>
            </div>
            <div>
              <div className="text-slate-400">部門 / {t('Department', 'Departamento')}</div>
              <div className="font-bold text-slate-900 mt-0.5">{activePr.departmentJp}</div>
              <div className="text-[10px] text-slate-500">
                {t(activePr.departmentEn, activePr.departmentPt)}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-slate-400">仕入先 / {t('Supplier', 'Fornecedor')}</div>
              <button
                onClick={() => openRecord('PARTNER', activePr.supplierId)}
                className="font-bold text-blue-900 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{activePr.supplierNameJp}</span>
              </button>
              <div className="text-[10px] text-slate-500">{activePr.supplierNameEn}</div>
            </div>
          </div>

          {/* Vertical Timeline: ✓ 申請 ↓ ✓ 部門承認 ↓ ● 購買承認 ↓ ○ 発注 ↓ ○ 入荷 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                決裁・調達進捗タイムライン / {t('Procurement Status Timeline', 'Timeline de Aprovação e Pedido')}
              </h4>
              {activePr.status === 'PENDING_APPROVAL' ? (
                <button
                  onClick={() => approvePurchaseRequest(activePr.id)}
                  className="px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>購買承認・発注を実行 (電子印鑑 押印)</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                  ✓ 決裁完了・EDI発注済 ({activePr.poNumber})
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-md p-5 bg-white space-y-4">
              {activePr.steps.map((step, idx) => {
                const isLast = idx === activePr.steps.length - 1;
                return (
                  <div key={step.key} className="relative flex items-start justify-between gap-4">
                    {!isLast && (
                      <div
                        className={`absolute left-3 top-7 w-0.5 h-8 ${
                          step.state === 'DONE' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {step.state === 'DONE' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        ) : step.state === 'CURRENT' ? (
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-amber-100">
                            ●
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs">
                            ○
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              step.state === 'DONE'
                                ? 'text-slate-900'
                                : step.state === 'CURRENT'
                                ? 'text-amber-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.labelJp}
                          </span>
                          <span className="text-xs text-slate-400">
                            / {t(step.labelEn, step.labelPt)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {step.actorJp ? `担当: ${step.actorJp}` : '待機中'}{' '}
                          {step.timestamp && `• ${step.timestamp}`}
                        </div>
                      </div>
                    </div>

                    {step.stampKanji && (
                      <HankoStamp
                        kanji={step.stampKanji}
                        size="sm"
                        animated={step.stampKanji === '山田'}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Related Records */}
          <RelatedRecordsBar
            records={[
              {
                type: 'PARTNER',
                id: activePr.supplierId,
                titleJp: activePr.supplierNameJp,
                titleEn: activePr.supplierNameEn,
                titlePt: activePr.supplierNameEn,
                statusJp: '仕入先 360°',
              },
              {
                type: 'DOC',
                id: activePr.id,
                titleJp: `購買稟議書 #${activePr.id}`,
                titleEn: 'Ringi Approval PDF',
                titlePt: 'PDF da Requisição Ringi',
                amount: activePr.amount,
                statusJp: 'PDF表示',
              },
              ...(activePr.relatedItemCode
                ? [
                    {
                      type: 'ITEM' as const,
                      id: activePr.relatedItemCode,
                      titleJp: '部品 C (高精度ベアリングユニット)',
                      titleEn: 'Component C (Nagoya Warehouse)',
                      titlePt: 'Componente C (Armazém Nagoya)',
                      statusJp: '在庫照会',
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>
    </div>
  );
};
