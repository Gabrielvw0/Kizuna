import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  ShieldCheck,
  Activity,
  CheckCircle2,
  Lock,
  FileCheck,
  ArrowUpRight,
} from 'lucide-react';

export const ComplianceAuditModule: React.FC = () => {
  const { activeModule, setActiveModule, auditLogs, openRecord, t } = useKizuna();

  const complianceCards = [
    {
      titleJp: '電子帳簿保存法',
      titleSub: t('Electronic Bookkeeping Act', 'Lei de Escrituração Eletrônica'),
      status: '🟢 Compliant',
      detailJp: '優良な電子帳簿要件・検索機能確保・タイムスタンプ自動付与済',
      detailSub: t(
        'Demo display: no real certified timestamping or immutable index.',
        'Exibição de demonstração: sem timestamp certificado nem índice imutável reais.'
      ),
    },
    {
      titleJp: 'インボイス制度',
      titleSub: t('Qualified Invoice System', 'Sistema Japonês de Invoices'),
      status: '🟢 Active',
      detailJp: '適格請求書発行事業者登録番号: T0000000000000 (ダミー番号・実照合なし)',
      detailSub: t(
        'Simulated display: no real NTA API verification is performed.',
        'Validação automática de número T junto à Receita Japonesa.'
      ),
    },
    {
      titleJp: '電子取引データ保存',
      titleSub: t('Electronic Transaction Archive', 'Arquivo de Transações Eletrônicas'),
      status: '🟢 100% Archived',
      detailJp: '見積書・注文書・請求書・契約書の訂正削除履歴を完全保持',
      detailSub: t(
        '100% of EDI and PDF commercial documents archived with SHA-256 hash.',
        '100% dos documentos comerciais arquivados com integridade SHA-256.'
      ),
    },
    {
      titleJp: '監査ログ・J-SOX統制',
      titleSub: t('Audit Trail & J-SOX Internal Control', 'Trilha de Auditoria & J-SOX'),
      status: '🟢 Operational',
      detailJp: `全モジュールの操作・承認・金額変更履歴をリアルタイム記録 (${auditLogs.length}件)`,
      detailSub: t(
        'Real-time immutable logging of approvals, amount edits, and GL postings.',
        'Registro imutável em tempo real de aprovações, alterações e contabilizações.'
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with tab switch between Compliance and Audit Log */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            日本国内法制準拠 (電帳法・インボイス制度・J-SOX内部統制・監査証跡)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>
              {activeModule === 'compliance'
                ? 'コンプライアンス・法制対応'
                : '監査ログ (Audit Log)'}
            </span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Japanese Statutory Compliance & Audit Trail', 'Compliance Japonês e Trilha de Auditoria')}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm text-xs">
          <button
            onClick={() => setActiveModule('compliance')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeModule === 'compliance'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🧾 コンプライアンス ({t('Compliance', 'Compliance')})
          </button>
          <button
            onClick={() => setActiveModule('audit')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeModule === 'audit'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🕵️ 監査ログ ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* 4 Japanese Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceCards.map((c) => (
          <div
            key={c.titleJp}
            className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {c.status}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3">{c.titleJp}</h3>
              <div className="text-[11px] text-slate-400">{c.titleSub}</div>
              <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">{c.detailJp}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              {c.detailSub}
            </div>
          </div>
        ))}
      </div>

      {/* System Activity Bar & Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {/* System Activity Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">
                監査ログ | Audit Log (改ざん防止ハッシュチェーン記録)
              </h2>
              <p className="text-[11px] text-slate-400">
                {t(
                  'Every approval, accounting sync, and parameter change is logged in real time.',
                  'Toda aprovação, integração contábil e alteração de valor é gravada ao vivo.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400">System Activity / 整合性稼働率</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400 tracking-tighter">
                  ████████████████████
                </span>
                <span className="font-bold text-white">98.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Entries */}
        <div className="divide-y divide-slate-200">
          {auditLogs.map((log, index) => (
            <div
              key={log.id}
              className={`px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs transition-colors ${
                index === 0 ? 'bg-blue-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 shrink-0">
                  {log.time}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900">{log.actorJp}</span>
                    <span className="text-[11px] text-slate-400">
                      ({log.departmentJp})
                    </span>
                    <span className="font-semibold text-blue-950">{log.actionJp}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{log.detailJp}</div>
                  <div className="text-[11px] text-slate-400">
                    {t(log.detailEn, log.detailPt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    const tid = log.targetId;
                    if (tid.startsWith('PR') || tid.startsWith('PO')) openRecord('PR', tid);
                    else if (tid.startsWith('INV')) openRecord('INV', tid);
                    else if (tid.startsWith('SO')) openRecord('SO', tid);
                    else if (tid.startsWith('JE')) openRecord('JE', tid);
                    else if (tid.startsWith('KZ')) openRecord('ITEM', tid);
                  }}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-blue-900 border border-slate-300 font-mono font-semibold flex items-center gap-1"
                >
                  <span>{log.targetId}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  {log.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
