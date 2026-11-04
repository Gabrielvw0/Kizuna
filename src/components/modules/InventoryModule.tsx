import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  Package,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  GitPullRequest,
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const {
    inventory,
    kpis,
    triggerReplenishment,
    openRecord,
    setActiveModule,
    t,
  } = useKizuna();

  const totalUnits = inventory.reduce((acc, i) => acc + i.stock, 0);
  const totalReserved = inventory.reduce((acc, i) => acc + i.reserved, 0);
  const totalIncoming = inventory.reduce((acc, i) => acc + i.incoming, 0);
  const outOfStockCount = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;

  const cards = [
    { labelJp: '総登録品目数', sub: 'Total Items', val: '12,842', meta: `実在庫 ${totalUnits}個` },
    { labelJp: '在庫評価金額', sub: 'Inventory Value', val: `¥${(kpis.inventoryValue / 1000000).toFixed(1)}M`, meta: '移動平均法評価' },
    { labelJp: '在庫低下注意', sub: 'Low Stock', val: `${kpis.lowStockCount} 品目`, meta: '安全在庫割れ', alert: true },
    { labelJp: '欠品発生', sub: 'Out of Stock', val: `${outOfStockCount} 品目`, meta: 'KZ-00882 (名古屋)', critical: outOfStockCount > 0 },
    { labelJp: '引当済在庫', sub: 'Reserved', val: `${totalReserved} 個`, meta: '受注・製造引当済' },
    { labelJp: '入荷予定数', sub: 'Incoming', val: `${totalIncoming} 個`, meta: '発注残・輸送中' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            全拠点倉庫リアルタイム在庫・安全在庫監視・自動発注連携
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>在庫管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Real-Time Inventory & Warehouse Control', 'Controle de Estoque e Armazéns em Tempo Real')}
            </span>
          </h1>
        </div>

        {/* Red Alert Banner: 🔴 欠品リスク 3 items require attention */}
        <div className="px-4 py-2.5 rounded-md bg-red-50 border border-red-300 text-red-950 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold">🔴 欠品リスク: {kpis.lowStockCount} items require attention</div>
            <div className="text-[11px] text-red-800">
              名古屋倉庫「部品 C (KZ-00882)」が欠品中 (購買稟議 #PR-2026-00842 と連動)
            </div>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((c) => (
          <div
            key={c.sub}
            className={`p-4 rounded-md bg-white border shadow-sm ${
              c.critical
                ? 'border-red-300 bg-red-50/20'
                : c.alert
                ? 'border-amber-300'
                : 'border-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-slate-800">{c.labelJp}</div>
            <div className="text-[10px] text-slate-400">{c.sub}</div>
            <div
              className={`text-2xl font-mono font-bold mt-2 tabular-nums ${
                c.critical ? 'text-red-700' : 'text-slate-900'
              }`}
            >
              {c.val}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">{c.meta}</div>
          </div>
        ))}
      </div>

      {/* Real-time Stock Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-800" />
              <span>リアルタイム拠点別在庫一覧 / {t('Real-Time Stock Ledger', 'Posição de Estoque em Tempo Real')}</span>
            </h2>
          </div>
          <button
            onClick={() => setActiveModule('production')}
            className="text-xs text-blue-800 font-semibold hover:underline flex items-center gap-1"
          >
            <span>部品構成表 (BOM) を確認</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">コード / Code</th>
                <th className="py-2.5 px-4 font-semibold">商品・品目名 / Item</th>
                <th className="py-2.5 px-4 font-semibold">倉庫 / Warehouse</th>
                <th className="py-2.5 px-4 font-semibold text-right">現在庫 / Stock</th>
                <th className="py-2.5 px-4 font-semibold text-right">最低在庫 / Min</th>
                <th className="py-2.5 px-4 font-semibold text-right">入荷予定 / Incoming</th>
                <th className="py-2.5 px-4 font-semibold text-center">状態 / Status</th>
                <th className="py-2.5 px-4 font-semibold">関連購買・アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inventory.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.nameJp}</div>
                    <div className="text-[10px] text-slate-400">
                      {t(item.nameEn, item.namePt)} • 仕入先: {item.supplierNameJp}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.warehouseJp} ({item.warehouseEn})
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm tabular-nums">
                    {item.stock}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 tabular-nums">
                    {item.minStock}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-800 tabular-nums">
                    +{item.incoming}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] ${
                        item.status === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status === 'WARNING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {item.status === 'NORMAL'
                        ? '正常'
                        : item.status === 'WARNING'
                        ? '注意'
                        : '欠品'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {item.code === 'KZ-00882' && (
                        <button
                          onClick={() => openRecord('PR', 'PR-2026-00842')}
                          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] flex items-center gap-1"
                        >
                          <GitPullRequest className="w-3 h-3" />
                          <span>PR-2026-00842</span>
                        </button>
                      )}
                      <button
                        onClick={() => triggerReplenishment(item.code)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-blue-900 text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>緊急発注手配</span>
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
