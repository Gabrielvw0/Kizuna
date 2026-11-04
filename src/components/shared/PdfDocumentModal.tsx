import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from './HankoStamp';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PdfDocumentModal: React.FC = () => {
  const { selectedDocId, setSelectedDocId, documents, t } = useKizuna();

  if (!selectedDocId) return null;

  const doc =
    documents.find((d) => d.id === selectedDocId) ||
    documents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-[2px]">
      <div className="w-full max-w-4xl bg-slate-100 border border-slate-300 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Toolbar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
              電子帳簿ビューア / PDF PREVIEW
            </span>
            <span className="text-sm font-bold">{doc.docType} #{doc.id}</span>
            <span className="text-xs text-slate-400">({doc.titleJp})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>印刷 / {t('Print', 'Imprimir')}</span>
            </button>
            <button
              onClick={() => setSelectedDocId(null)}
              className="text-slate-400 hover:text-white p-1.5 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simulated A4 Japanese Official Corporate Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-slate-200/70">
          <div className="w-full max-w-2xl bg-white border border-slate-300 shadow-lg p-8 sm:p-10 text-slate-900 space-y-6">
            {/* Compliance Ribbon inside PDF */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-[10px] font-mono text-slate-500">
                  文書管理番号: {doc.id} | 電子帳簿保存法 適格タイムスタンプ: 2026-10-21 09:00:12 JST
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-widest text-slate-900 mt-1">
                  {doc.docType} ({doc.docTypeEn.toUpperCase()})
                </h1>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-semibold">発行日: {doc.issueDate}</div>
                {doc.expiryDate && (
                  <div className="text-slate-500">有効期限: {doc.expiryDate}</div>
                )}
              </div>
            </div>

            {/* Counterparty & Issuer Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">取引先 / Counterparty</div>
                <div className="text-lg font-bold border-b border-slate-400 pb-1 inline-block pr-6">
                  {doc.partnerNameJp} 御中
                </div>
                <div className="text-xs text-slate-600">{doc.partnerNameEn}</div>
                <div className="text-xs text-slate-500 pt-2">
                  下記の通り、{doc.docType}の内容を証明いたします。
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <div className="text-sm font-bold text-slate-900">
                  絆コーポレーション株式会社 (KIZUNA CORPORATION)
                </div>
                <div className="text-xs text-slate-600">
                  〒000-0000 東京都 サンプル区 ダミー町 1-1-1 (架空の所在地) 東京本社
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  適格請求書発行事業者登録番号: T0000000000000 (ダミー)
                </div>

                {/* Hanko Box */}
                <div className="pt-3 flex sm:justify-end gap-3">
                  {doc.stamps.map((kanji, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-300 px-2.5 py-1.5 rounded bg-slate-50/50"
                    >
                      <HankoStamp
                        kanji={kanji}
                        size="md"
                        roleLabel={idx === 0 ? '決裁印' : idx === 1 ? '審査印' : '担当印'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Amount Highlight Box */}
            <div className="bg-slate-900 text-white px-5 py-3.5 rounded flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wider">
                合計金額 (税抜) / TOTAL CONTRACT AMOUNT
              </span>
              <span className="text-2xl font-mono font-bold tabular-nums">
                ¥{doc.amount.toLocaleString()} -
              </span>
            </div>

            {/* Particulars Table */}
            <div className="border border-slate-300">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="py-2 px-3 border-r border-slate-300">No.</th>
                    <th className="py-2 px-3 border-r border-slate-300">件名・摘要 / Description</th>
                    <th className="py-2 px-3 border-r border-slate-300 text-center">税区分</th>
                    <th className="py-2 px-3 text-right">金額 (JPY)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono">01</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-medium">
                      {doc.titleJp} ({doc.titleEn})
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 text-center">
                      課税 10%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      ¥{doc.amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 border-r border-slate-300 font-mono">02</td>
                    <td className="py-2.5 px-3 border-r border-slate-300 text-slate-600">
                      消費税額等 (10%対象: ¥{doc.amount.toLocaleString()})
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 text-center">
                      消費税
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ¥{Math.round(doc.amount * 0.1).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legal & Compliance Footer inside A4 */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  電子帳簿保存法第7条（電子取引データ保存）および適格請求書等保存方式に完全準拠
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>SHA-256 INTEGRITY VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
