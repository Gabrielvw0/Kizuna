import React, { useMemo } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { RecordType } from '../../types/erp';
import {
  Search,
  X,
  ArrowUpRight,
  GitBranch,
  FileText,
  ShoppingCart,
  Building2,
  BookOpen,
  Package,
} from 'lucide-react';

interface SearchResultGroup {
  type: RecordType;
  id: string;
  categoryJp: string;
  categoryEn: string;
  categoryPt: string;
  titleJp: string;
  titleSub: string;
  amount?: number;
  statusJp: string;
  statusSub: string;
  relatedTree: {
    type: RecordType;
    id: string;
    labelJp: string;
    labelEn: string;
    labelPt: string;
    meta?: string;
  }[];
}

export const CommandCenterModal: React.FC = () => {
  const {
    isCommandOpen,
    setCommandOpen,
    commandQuery,
    setCommandQuery,
    salesOrders,
    purchaseRequests,
    partners,
    invoices,
    documents,
    inventory,
    openRecord,
    t,
    subLang,
  } = useKizuna();

  const results = useMemo<SearchResultGroup[]>(() => {
    const q = commandQuery.trim().toLowerCase();

    const groups: SearchResultGroup[] = [];

    // 1. Sales Orders (including SO-2026-10482)
    salesOrders.forEach((so) => {
      const hay = `${so.id} ${so.partnerNameJp} ${so.partnerNameEn} ${so.invoiceId} ${so.contractId} ${so.journalEntryId || ''}`.toLowerCase();
      if (!q || hay.includes(q)) {
        const inv = invoices.find((i) => i.id === so.invoiceId);
        groups.push({
          type: 'SO',
          id: so.id,
          categoryJp: '注文 (受注伝票)',
          categoryEn: 'Sales Order',
          categoryPt: 'Pedido de Venda',
          titleJp: so.partnerNameJp,
          titleSub: `${so.partnerNameEn} — ${so.itemsSummaryJp}`,
          amount: so.amount,
          statusJp: so.statusJp,
          statusSub: subLang === 'EN' ? so.statusEn : so.statusPt,
          relatedTree: [
            {
              type: 'INV',
              id: so.invoiceId,
              labelJp: `Invoice ${so.invoiceId} (適格請求書)`,
              labelEn: `Invoice ${so.invoiceId}`,
              labelPt: `Fatura ${so.invoiceId}`,
              meta: `¥${so.amount.toLocaleString()}`,
            },
            {
              type: 'PARTNER',
              id: so.partnerId,
              labelJp: `Customer ${so.partnerNameJp} (${so.partnerNameEn})`,
              labelEn: `Customer ${so.partnerNameEn}`,
              labelPt: `Cliente ${so.partnerNameEn}`,
              meta: '取引先 360°',
            },
            {
              type: 'CONTRACT',
              id: so.contractId,
              labelJp: `Contract ${so.contractId} (基本取引契約書)`,
              labelEn: `Contract ${so.contractId}`,
              labelPt: `Contrato ${so.contractId}`,
              meta: '🟢 有効',
            },
            {
              type: 'PAYMENT',
              id: inv?.paymentId || 'PAY-2026-01928',
              labelJp: `Payment ${inv?.paymentId || 'PAY-2026-01928'} (入金予定・消込)`,
              labelEn: `Payment ${inv?.paymentId || 'PAY-2026-01928'}`,
              labelPt: `Pagamento ${inv?.paymentId || 'PAY-2026-01928'}`,
              meta: 'デモ銀行 本店 (架空)',
            },
            {
              type: 'JE',
              id: so.journalEntryId || 'JE-2026-02841',
              labelJp: `Journal Entry ${so.journalEntryId || 'JE-2026-02841'} (売掛金 / 売上高)`,
              labelEn: `Journal Entry ${so.journalEntryId || 'JE-2026-02841'}`,
              labelPt: `Lançamento Contábil ${so.journalEntryId || 'JE-2026-02841'}`,
              meta: `¥${so.amount.toLocaleString()}`,
            },
          ],
        });
      }
    });

    // 2. Purchase Requests (including PR-2026-00842)
    purchaseRequests.forEach((pr) => {
      const hay = `${pr.id} ${pr.poNumber || ''} ${pr.supplierNameJp} ${pr.supplierNameEn} ${pr.requesterJp} ${pr.titleJp}`.toLowerCase();
      if (!q || hay.includes(q)) {
        groups.push({
          type: 'PR',
          id: pr.id,
          categoryJp: '発注依頼・購買稟議',
          categoryEn: 'Purchase Request (Ringi)',
          categoryPt: 'Requisição de Compra (Ringi)',
          titleJp: `${pr.supplierNameJp} — ${pr.requesterJp} (${pr.departmentJp})`,
          titleSub: subLang === 'EN' ? pr.titleEn : pr.titlePt,
          amount: pr.amount,
          statusJp: pr.statusJp,
          statusSub: subLang === 'EN' ? pr.statusEn : pr.statusPt,
          relatedTree: [
            {
              type: 'PARTNER',
              id: pr.supplierId,
              labelJp: `Supplier ${pr.supplierNameJp}`,
              labelEn: `Supplier ${pr.supplierNameEn}`,
              labelPt: `Fornecedor ${pr.supplierNameEn}`,
              meta: '仕入先マスタ',
            },
            {
              type: 'DOC',
              id: pr.id,
              labelJp: `Ringi Document ${pr.id} (購買稟議書 PDF)`,
              labelEn: `Ringi Document ${pr.id}`,
              labelPt: `Documento Ringi ${pr.id}`,
              meta: '電子印鑑付',
            },
            ...(pr.relatedItemCode
              ? [
                  {
                    type: 'ITEM' as RecordType,
                    id: pr.relatedItemCode,
                    labelJp: `Inventory Item ${pr.relatedItemCode} (部品 C — 名古屋倉庫)`,
                    labelEn: `Inventory Item ${pr.relatedItemCode}`,
                    labelPt: `Item de Estoque ${pr.relatedItemCode}`,
                    meta: '在庫照会',
                  },
                ]
              : []),
          ],
        });
      }
    });

    // 3. Partners (Yamada Corp, Aoba Components, etc.)
    partners.forEach((ptn) => {
      const hay = `${ptn.id} ${ptn.code} ${ptn.nameJp} ${ptn.nameEn} ${ptn.invoiceRegNo}`.toLowerCase();
      if (q && hay.includes(q)) {
        groups.push({
          type: 'PARTNER',
          id: ptn.id,
          categoryJp: '取引先マスタ (360°)',
          categoryEn: 'Business Partner',
          categoryPt: 'Parceiro de Negócios',
          titleJp: ptn.nameJp,
          titleSub: `${ptn.nameEn} (${ptn.locationJp})`,
          amount: ptn.receivableBalance || ptn.payableBalance,
          statusJp: `格付 ${ptn.rating}`,
          statusSub: ptn.invoiceRegNo,
          relatedTree: [
            ...ptn.orders.map((ordId) => ({
              type: (ordId.startsWith('PR') ? 'PR' : 'SO') as RecordType,
              id: ordId,
              labelJp: `Order ${ordId}`,
              labelEn: `Order ${ordId}`,
              labelPt: `Pedido ${ordId}`,
            })),
            ...ptn.contracts.map((cId) => ({
              type: 'CONTRACT' as RecordType,
              id: cId,
              labelJp: `Contract ${cId}`,
              labelEn: `Contract ${cId}`,
              labelPt: `Contrato ${cId}`,
            })),
            ...ptn.invoices.map((iId) => ({
              type: 'INV' as RecordType,
              id: iId,
              labelJp: `Invoice ${iId}`,
              labelEn: `Invoice ${iId}`,
              labelPt: `Fatura ${iId}`,
            })),
          ],
        });
      }
    });

    // 4. Documents / Contracts
    documents.forEach((doc) => {
      const hay = `${doc.id} ${doc.docType} ${doc.titleJp} ${doc.partnerNameJp} ${doc.partnerNameEn}`.toLowerCase();
      if (q && hay.includes(q) && !groups.some((g) => g.id === doc.id)) {
        groups.push({
          type: 'DOC',
          id: doc.id,
          categoryJp: `文書管理 (${doc.docType})`,
          categoryEn: doc.docTypeEn,
          categoryPt: doc.docTypePt,
          titleJp: doc.titleJp,
          titleSub: `${doc.partnerNameJp} (${doc.issueDate})`,
          amount: doc.amount,
          statusJp: doc.statusJp,
          statusSub: subLang === 'EN' ? doc.statusEn : doc.statusPt,
          relatedTree: doc.relatedIds.map((rId) => ({
            type: rId.startsWith('SO')
              ? 'SO'
              : rId.startsWith('INV')
              ? 'INV'
              : rId.startsWith('PTN')
              ? 'PARTNER'
              : rId.startsWith('JE')
              ? 'JE'
              : 'DOC',
            id: rId,
            labelJp: `Related Record ${rId}`,
            labelEn: `Related Record ${rId}`,
            labelPt: `Registro Vinculado ${rId}`,
          })),
        });
      }
    });

    // 5. Inventory
    inventory.forEach((item) => {
      const hay = `${item.code} ${item.nameJp} ${item.nameEn} ${item.warehouseJp}`.toLowerCase();
      if (q && hay.includes(q)) {
        groups.push({
          type: 'ITEM',
          id: item.code,
          categoryJp: '在庫品目マスタ',
          categoryEn: 'Inventory SKU',
          categoryPt: 'SKU de Estoque',
          titleJp: `${item.code} — ${item.nameJp}`,
          titleSub: `${item.warehouseJp}倉庫 | 在庫: ${item.stock} / 最低: ${item.minStock}`,
          amount: item.stock * item.unitPrice,
          statusJp:
            item.status === 'NORMAL' ? '正常' : item.status === 'WARNING' ? '注意' : '欠品',
          statusSub: item.status,
          relatedTree: [
            {
              type: 'PR',
              id: 'PR-2026-00842',
              labelJp: 'Purchase Request PR-2026-00842 (補充稟議)',
              labelEn: 'Purchase Request PR-2026-00842',
              labelPt: 'Requisição PR-2026-00842',
            },
          ],
        });
      }
    });

    return groups.slice(0, 6);
  }, [commandQuery, salesOrders, purchaseRequests, partners, invoices, documents, inventory, subLang]);

  if (!isCommandOpen) return null;

  const quickChips = [
    { label: 'SO-2026-10482', desc: '山田 ¥8.42M' },
    { label: 'PR-2026-00842', desc: '青葉部品 ¥2.84M' },
    { label: '株式会社山田', desc: 'Customer 360°' },
    { label: 'CT-2026-0841', desc: '基本契約書' },
    { label: 'KZ-00882', desc: '部品 C (欠品)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-[2px]">
      <div className="w-full max-w-3xl bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-blue-800 shrink-0" />
          <input
            type="text"
            autoFocus
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            placeholder={t(
              'Search orders, invoices, partners, journal entries (e.g. SO-2026-10482, PR-2026-00842, 山田)...',
              'Buscar pedidos, faturas, clientes, lançamentos (ex: SO-2026-10482, PR-2026-00842, 山田)...'
            )}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          {commandQuery && (
            <button
              onClick={() => setCommandQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 px-1.5 py-0.5"
            >
              Clear
            </button>
          )}
          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
            ESC
          </span>
          <button
            onClick={() => setCommandOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Bar */}
        <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">
            クイック検索 / {t('Quick Jump:', 'Atalhos:')}
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setCommandQuery(chip.label)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors shrink-0 flex items-center gap-1.5 ${
                commandQuery === chip.label
                  ? 'bg-blue-900 text-white border-blue-900 font-medium'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500'
              }`}
            >
              <span className="font-mono">{chip.label}</span>
              <span
                className={`text-[10px] ${
                  commandQuery === chip.label ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {chip.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Relational Search Results */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              検索結果・関連データグラフ / {t('Relational Search Results', 'Resultados e Grafo de Relações')}
            </span>
            <span className="font-mono text-[11px]">
              {results.length} {t('primary records matched', 'registros encontrados')}
            </span>
          </div>

          {results.map((group) => (
            <div
              key={`${group.type}-${group.id}`}
              className="border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden"
            >
              {/* Primary Record Row */}
              <div
                onClick={() => openRecord(group.type, group.id)}
                className="p-3.5 bg-slate-50/70 hover:bg-blue-50/50 cursor-pointer transition-colors border-b border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-900 text-white rounded">
                      {group.categoryJp}
                    </span>
                    <span className="text-xs text-slate-500">
                      {subLang === 'EN' ? group.categoryEn : group.categoryPt}
                    </span>
                    <span className="text-sm font-mono font-bold text-blue-900">
                      {group.id}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 pt-0.5">
                    {group.titleJp}
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      {group.titleSub}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {group.amount !== undefined && (
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                        ¥{group.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">税込 / Tax Excl.</div>
                    </div>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    {group.statusJp}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Relational Tree (関連情報) */}
              <div className="px-4 py-3 bg-white">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                  <GitBranch className="w-3.5 h-3.5 text-blue-700" />
                  <span>関連情報 / {t('Connected Entities (Click to inspect)', 'Registros Conectados (Clique para abrir)')}</span>
                </div>
                <div className="space-y-1 pl-2 font-mono text-xs">
                  {group.relatedTree.map((rel, idx) => {
                    const isLast = idx === group.relatedTree.length - 1;
                    const branchChar = isLast ? '└─' : '├─';
                    return (
                      <button
                        key={`${rel.type}-${rel.id}-${idx}`}
                        onClick={() => openRecord(rel.type, rel.id)}
                        className="w-full flex items-center justify-between py-1 px-2 rounded hover:bg-slate-100 text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-slate-400 select-none">{branchChar}</span>
                          <span className="font-semibold text-slate-800 group-hover:text-blue-800 truncate">
                            {rel.labelJp}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rel.meta && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {rel.meta}
                            </span>
                          )}
                          <span className="text-[11px] text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity font-sans font-medium">
                            {t('Open →', 'Abrir →')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-900 text-slate-300 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-white">絆 KIZUNA GRAPH ENGINE:</strong> 全モジュール横断リレーショナル検索
            </span>
          </div>
          <div className="font-mono text-slate-400">
            ⌘K / Ctrl+K
          </div>
        </div>
      </div>
    </div>
  );
};
