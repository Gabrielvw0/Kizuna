import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from '../shared/HankoStamp';
import {
  FileText,
  ShieldCheck,
  Eye,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const DocumentsModule: React.FC = () => {
  const { documents, setSelectedDocId, stampDocument, openRecord, t } = useKizuna();
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const docTypes = [
    'ALL',
    '見積書',
    '注文書',
    '請求書',
    '領収書',
    '契約書',
    '納品書',
    '稟議書',
    '申請書',
  ];

  const featuredContract =
    documents.find((d) => d.id === 'CT-2026-0841') || documents[0];

  const filteredDocs = documents.filter(
    (d) => selectedType === 'ALL' || d.docType === selectedType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            電子帳簿保存法・インボイス制度対応 証憑・契約書統合アーカイブ
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>文書管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Corporate Document & Contract Repository', 'Gestão de Documentos e Contratos')}
            </span>
          </h1>
        </div>

        {/* Document Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm text-xs">
          {docTypes.map((dt) => (
            <button
              key={dt}
              onClick={() => setSelectedType(dt)}
              className={`px-2.5 py-1.5 rounded transition-colors ${
                selectedType === dt
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {dt === 'ALL' ? t('All Docs (全種別)', 'Todos (全種別)') : dt}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Contract Hero Card: 契約書 #CT-2026-0841 */}
      <div className="bg-white border-2 border-blue-900/20 rounded-md p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white">
              契約書 #{featuredContract.id}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span>🟢 有効</span>
              <span className="text-[10px] font-normal">/ Valid</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              電子帳簿保存法タイムスタンプ済
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {featuredContract.titleJp} ({featuredContract.titleEn})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 text-xs">
            <div>
              <div className="text-slate-400">締結日 / Effective Date</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {featuredContract.issueDate}
              </div>
            </div>
            <div>
              <div className="text-slate-400">有効期限 / Expiry Date</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">
                {featuredContract.expiryDate}
              </div>
            </div>
            <div>
              <div className="text-slate-400">取引先 / Counterparty</div>
              <button
                onClick={() => openRecord('PARTNER', featuredContract.partnerId)}
                className="font-bold text-blue-900 hover:underline mt-0.5 block"
              >
                {featuredContract.partnerNameJp}
              </button>
            </div>
            <div>
              <div className="text-slate-400">契約金額 / Contract Value</div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5 tabular-nums">
                ¥{featuredContract.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {featuredContract.stamps.map((s, i) => (
              <HankoStamp key={i} kanji={s} size="md" />
            ))}
          </div>

          <button
            onClick={() => setSelectedDocId(featuredContract.id)}
            className="px-5 py-3 rounded-md bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>PDFを表示 ({t('Open Official PDF', 'Abrir PDF Oficial')})</span>
          </button>
        </div>
      </div>

      {/* Document Repository Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-800" />
            <span>電子証憑・文書アーカイブ一覧 / {t('Electronic Document Archive', 'Repositório de Documentos')}</span>
          </h3>
          <span className="text-xs font-mono text-emerald-700">
            100% 電子取引データ保存済
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">文書番号 / ID</th>
                <th className="py-2.5 px-4 font-semibold">種別 / Type</th>
                <th className="py-2.5 px-4 font-semibold">件名 / Document Title</th>
                <th className="py-2.5 px-4 font-semibold">取引先 / Partner</th>
                <th className="py-2.5 px-4 font-semibold">発行日 / 期限</th>
                <th className="py-2.5 px-4 font-semibold text-right">金額 / Amount</th>
                <th className="py-2.5 px-4 font-semibold text-center">状態</th>
                <th className="py-2.5 px-4 font-semibold text-right">操作 / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                    {doc.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                      {doc.docType}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {t(doc.docTypeEn, doc.docTypePt)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{doc.titleJp}</div>
                    <div className="text-[10px] text-slate-400">{doc.titleEn}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => openRecord('PARTNER', doc.partnerId)}
                      className="font-semibold text-slate-800 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.partnerNameJp}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div>{doc.issueDate}</div>
                    {doc.expiryDate && (
                      <div className="text-[10px] text-slate-400">~ {doc.expiryDate}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ¥{doc.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] ${
                        doc.status === 'VALID'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{doc.statusJp}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => stampDocument(doc.id, '山田')}
                        className="px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>印 押印</span>
                      </button>
                      <button
                        onClick={() => setSelectedDocId(doc.id)}
                        className="px-3 py-1.5 rounded bg-slate-900 hover:bg-blue-900 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>PDFを表示</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
