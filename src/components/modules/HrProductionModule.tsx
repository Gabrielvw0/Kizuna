import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from '../shared/HankoStamp';
import {
  Users,
  Factory,
  GitBranch,
  Package,
  Building2,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const HrProductionModule: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    employees,
    inventory,
    openRecord,
    t,
  } = useKizuna();

  const featuredEmp = employees[0]; // 山田 太郎 (Senior Sales Manager, 営業部, 東京本社, 入社日: 2021年04月01日)

  const departments = [
    { jp: '営業部', en: 'Sales Dept.', headcount: 84, manager: '山田 太郎' },
    { jp: '経理部', en: 'Accounting Dept.', headcount: 28, manager: '佐藤 美咲' },
    { jp: '総務部', en: 'General Affairs', headcount: 22, manager: '佐々木 剛' },
    { jp: '人事部', en: 'Human Resources', headcount: 18, manager: '小林 由美' },
    { jp: '購買部', en: 'Procurement Dept.', headcount: 31, manager: '鈴木 健二' },
    { jp: '製造部', en: 'Manufacturing Dept.', headcount: 164, manager: '田中 健一' },
    { jp: '情報システム部', en: 'Information Systems', headcount: 26, manager: '高橋 涼子' },
  ];

  const compA = inventory.find((i) => i.code === 'KZ-00124');
  const compB = inventory.find((i) => i.code === 'KZ-00291');
  const compC = inventory.find((i) => i.code === 'KZ-00882');

  return (
    <div className="space-y-6">
      {/* Header with switch between HR and Production */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            {activeModule === 'hr'
              ? '人事マスタ・組織編成・勤怠給与・タレントマネジメント'
              : '生産計画・製造指図・部品構成表 (BOM)・原価計算統合モジュール'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>{activeModule === 'hr' ? '人事管理' : '生産管理 (BOM)'}</span>
            <span className="text-sm font-normal text-slate-500">
              / {activeModule === 'hr'
                ? t('Human Resources & Organization', 'Recursos Humanos e Estrutura Organizacional')
                : t('Production Control & Bill of Materials', 'Gestão de Produção e Estrutura de Produto (BOM)')}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm text-xs">
          <button
            onClick={() => setActiveModule('hr')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeModule === 'hr'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👨‍💼 人事管理 ({t('Human Resources', 'RH')})
          </button>
          <button
            onClick={() => setActiveModule('production')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeModule === 'production'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏭 生産管理・BOM ({t('Production & BOM', 'Produção & BOM')})
          </button>
        </div>
      </div>

      {/* VIEW 1: HUMAN RESOURCES (人事管理) */}
      {activeModule === 'hr' && (
        <div className="space-y-6">
          {/* Featured Employee Card: 社員情報 山田 太郎 */}
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-xl border-2 border-blue-500 shrink-0">
                山田
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                    社員情報 | Employee Record • {featuredEmp.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                    {featuredEmp.statusJp}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 pt-1">
                  {featuredEmp.nameJp}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    ({featuredEmp.nameRomaji})
                  </span>
                </h2>
                <div className="text-sm font-semibold text-blue-900">
                  {featuredEmp.roleEn} — {featuredEmp.roleJp}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>所属: <strong>{featuredEmp.departmentJp}</strong></span>
                  <span>•</span>
                  <span>拠点: <strong>{featuredEmp.branchJp}</strong></span>
                  <span>•</span>
                  <span>入社日: <strong>{featuredEmp.joinDate}</strong></span>
                  <span>•</span>
                  <span>等級: <strong>{featuredEmp.grade}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right text-xs space-y-1">
                <div className="text-slate-400">有給休暇消化率 / Paid Leave</div>
                <div className="font-mono font-bold text-slate-900">14 / 20 日 (70%)</div>
                <div className="text-slate-400 pt-1">人事考課評価 / Evaluation</div>
                <div className="font-mono font-bold text-emerald-700">Sランク (全社上位 5%)</div>
              </div>
              <HankoStamp kanji={featuredEmp.stampKanji} size="lg" roleLabel="登録電子印" />
            </div>
          </div>

          {/* Japanese Corporate Departments & Employee Directory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Building2 className="w-4 h-4 text-blue-800" />
                <span>部門編成マスタ / {t('Corporate Departments', 'Departamentos Corporativos')}</span>
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {departments.map((d) => (
                  <div key={d.jp} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{d.jp}</div>
                      <div className="text-[10px] text-slate-400">{d.en}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">{d.headcount} 名</div>
                      <div className="text-[10px] text-slate-500">部門長: {d.manager}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Users className="w-4 h-4 text-blue-800" />
                <span>主要役職員・決裁権限者一覧 / {t('Key Personnel & Approvers', 'Quadro de Gestores e Aprovadores')}</span>
              </h3>
              <div className="divide-y divide-slate-200 text-xs">
                {employees.map((emp) => (
                  <div key={emp.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HankoStamp kanji={emp.stampKanji} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900">
                          {emp.nameJp}{' '}
                          <span className="font-normal text-slate-400">({emp.nameRomaji})</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {emp.departmentJp} • {emp.roleEn} ({emp.branchJp})
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-500">
                      <div>入社: {emp.joinDate}</div>
                      <div className="text-slate-800 font-semibold">{emp.grade}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PRODUCTION & BOM (生産管理 / 部品構成表) */}
      {activeModule === 'production' && (
        <div className="space-y-6">
          {/* 6 Production KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { jp: '製造指図数', sub: 'Production Orders', val: '18 ロット', meta: '東京・名古屋工場' },
              { jp: '計画生産数', sub: 'Planned Production', val: '240 台', meta: '当月計画 (KZ-500)' },
              { jp: '製造仕掛中', sub: 'In Production', val: '64 台', meta: '第2組立ライン稼働中' },
              { jp: '完成品入庫済', sub: 'Completed', val: '176 台', meta: '進捗率 73.3%' },
              { jp: '部材充足率', sub: 'Material Availability', val: '91.4%', meta: '部品 C 緊急調達中', warn: true },
              { jp: '標準製造原価', sub: 'Production Cost', val: '¥412,000', meta: '1台あたり原価' },
            ].map((c) => (
              <div
                key={c.sub}
                className={`p-4 rounded-md bg-white border shadow-sm ${
                  c.warn ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-800">{c.jp}</div>
                <div className="text-[10px] text-slate-400">{c.sub}</div>
                <div className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
                  {c.val}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{c.meta}</div>
              </div>
            ))}
          </div>

          {/* BOM (部品構成表) Visual Tree + Live Stock Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 Cols: BOM Tree exactly as specified */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-blue-800">
                    BILL OF MATERIALS (BOM)
                  </span>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <GitBranch className="w-4 h-4 text-blue-800" />
                    <span>部品構成表 — 製品 KZ-500 (統合産業制御ユニット)</span>
                  </h2>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  REV 4.2
                </span>
              </div>

              {/* Tree Diagram */}
              <div className="p-5 bg-slate-900 text-white rounded-md font-mono text-sm space-y-3">
                <div className="font-bold text-base text-blue-300 flex items-center justify-between">
                  <span>製品 KZ-500 (完成品: 統合産業制御ユニット)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200">
                    注文 #SO-2026-10482 対象製品
                  </span>
                </div>
                <div className="pl-3 space-y-2.5 text-xs">
                  <div
                    onClick={() => setActiveModule('inventory')}
                    className="flex items-center justify-between p-2 rounded bg-slate-800/90 hover:bg-slate-800 cursor-pointer border border-slate-700"
                  >
                    <span>├── 部品 A (KZ-00124 高精度センサー) × 4</span>
                    <span className="text-emerald-400">
                      東京倉庫: 在庫 {compA?.stock ?? 482}個 (正常)
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveModule('inventory')}
                    className="flex items-center justify-between p-2 rounded bg-slate-800/90 hover:bg-slate-800 cursor-pointer border border-amber-500/40"
                  >
                    <span>├── 部品 B (KZ-00291 サーボ駆動シャフト) × 2</span>
                    <span className="text-amber-300">
                      大阪倉庫: 在庫 {compB?.stock ?? 38}個 (注意)
                    </span>
                  </div>

                  <div
                    onClick={() => openRecord('PR', 'PR-2026-00842')}
                    className="flex items-center justify-between p-2 rounded bg-slate-800/90 hover:bg-slate-800 cursor-pointer border border-red-500/50"
                  >
                    <span>├── 部品 C (KZ-00882 高精度ベアリング) × 8</span>
                    <span className="text-red-400 font-bold">
                      名古屋倉庫: 在庫 {compC?.stock ?? 0}個 (欠品 → PR-2026-00842)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-800">
                    <span>└── 組立工数 (最終検査・キャリブレーション含) 2.5h</span>
                    <span className="text-slate-400">標準労務費: ¥18,500 / 台</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Connected Orders & MRP Status */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    生産・販売・在庫・購買 MRP 連動状況
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(
                      'Demonstrates how Sales Order #SO-2026-10482 drives BOM consumption and Purchase Request #PR-2026-00842.',
                      'Demonstra como o Pedido de Venda #SO-2026-10482 consome o BOM e aciona a Requisição de Compra #PR-2026-00842.'
                    )}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div
                    onClick={() => openRecord('SO', 'SO-2026-10482')}
                    className="p-3.5 rounded border border-slate-200 hover:border-blue-500 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        1. 販売受注: #SO-2026-10482 (株式会社山田)
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        製品 KZ-500 × 12台 受注承認済 (¥8,420,000)
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-blue-800" />
                  </div>

                  <div
                    onClick={() => setActiveModule('inventory')}
                    className="p-3.5 rounded border border-red-200 bg-red-50/30 hover:border-red-400 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-red-950">
                        2. 在庫引当・欠品検知: 部品 C (KZ-00882)
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        12台 × 8個 = 96個必要 → 名古屋倉庫欠品のため購買稟議を自動生成
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-red-700" />
                  </div>

                  <div
                    onClick={() => openRecord('PR', 'PR-2026-00842')}
                    className="p-3.5 rounded border border-amber-200 bg-amber-50/30 hover:border-amber-400 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-amber-950">
                        3. 購買稟議・発注: #PR-2026-00842 (青葉部品株式会社)
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        田中 健一 (製造部) 申請 • ¥2,840,000 • ワークフロー決裁連動
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-amber-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
