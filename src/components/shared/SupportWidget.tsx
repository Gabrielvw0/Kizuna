import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  Headphones,
  X,
  Send,
  CheckCircle2,
  Activity,
  PhoneCall,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const SupportWidget: React.FC = () => {
  const { recordCustomAction, setActiveModule, t } = useKizuna();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'DIAG' | 'TICKET'>('CHAT');
  const [chatInput, setChatInput] = useState('');
  const [ticketSubject, setTicketSubject] = useState('名古屋支社 倉庫EDI連携パラメータの確認依頼');
  const [diagRunning, setDiagRunning] = useState(false);

  const [chatLog, setChatLog] = useState<
    { sender: 'DESK' | 'USER'; time: string; textJp: string; textSub: string }[]
  >([
    {
      sender: 'DESK',
      time: '10:35',
      textJp:
        'デモ用サポートデスク（模擬）でございます。システム操作・会計連携・電子印鑑設定など、ご不明点がございましたらお気軽にお申し付けください。',
      textSub: t(
        'Welcome to the Demo Support Desk (simulated). How may we assist you with Kizuna ERP today?',
        'Bem-vindo ao Suporte de demonstração (simulado). Como podemos ajudar na operação do Kizuna ERP?'
      ),
    },
  ]);

  const askQuickFaq = (topic: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    let replyJp = '';
    let replySub = '';

    if (topic === 'AR') {
      replyJp =
        '【売掛金・会計連携の手順】ダッシュボードの「未回収債権」または販売管理から注文（例: #SO-2026-10482）を開き、「会計へ連携」ボタンをクリックすると、借方:売掛金 / 貸方:売上高の仕訳が自動起票されます。';
      replySub = t(
        'Open Order #SO-2026-10482 from Dashboard or Sales and click "会計へ連携 (Post to Accounting)" to automatically generate the General Ledger entry.',
        'Abra o Pedido #SO-2026-10482 pelo Dashboard ou Vendas e clique em "会計へ連携" para gerar automaticamente o lançamento contábil.'
      );
    } else if (topic === 'HANKO') {
      replyJp =
        '【電子印鑑・稟議ワークフロー】ワークフロー画面にて「#PR-2026-00842」を選択し、承認ボタンを押すと山田部長の電子印鑑が押印され、買掛金・発注残・監査ログへリアルタイム反映されます。';
      replySub = t(
        'Select #PR-2026-00842 in Workflow and click Approve to stamp your digital Hanko and update AP, POs, and Audit Log in real time.',
        'Selecione #PR-2026-00842 em Workflow e clique em Aprovar para aplicar o Hanko digital e atualizar Contas a Pagar e Audit Log.'
      );
    } else {
      replyJp =
        '【ショートカット検索 ⌘K】画面上部の検索バー（または Ctrl+K / ⌘K）から注文番号・請求書番号を入力すると、紐づく全関連レコードのツリーが表示されます。';
      replySub = t(
        'Press Ctrl+K / ⌘K anywhere to open the Relational Command Center and inspect connected records.',
        'Pressione Ctrl+K / ⌘K em qualquer tela para abrir o Command Center e ver a árvore de registros conectados.'
      );
    }

    setChatLog((prev) => [
      ...prev,
      {
        sender: 'USER',
        time: now,
        textJp:
          topic === 'AR'
            ? '売掛金の会計連携手順について教えて'
            : topic === 'HANKO'
            ? '電子印鑑（Hanko）の承認反映について'
            : '関連レコード検索（⌘K）の使い方',
        textSub: topic,
      },
      {
        sender: 'DESK',
        time: now,
        textJp: replyJp,
        textSub: replySub,
      },
    ]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date().toTimeString().slice(0, 5);
    const q = chatInput.trim();
    setChatInput('');

    setChatLog((prev) => [
      ...prev,
      { sender: 'USER', time: now, textJp: q, textSub: q },
      {
        sender: 'DESK',
        time: now,
        textJp: `承知いたしました。「${q}」の件につきまして、東京本社・専任エンジニアチームにて設定状況を確認いたしました。すべてのモジュール連携は正常に稼働しております。`,
        textSub: t(
          `Understood. Our Tokyo HQ engineering desk has verified "${q}". All ERP modules and integrations are operating normally.`,
          `Compreendido. Nossa equipe técnica em Tóquio verificou "${q}". Todos os módulos e integrações estão operando normalmente.`
        ),
      },
    ]);
  };

  const handleRunDiagnostics = () => {
    setDiagRunning(true);
    setTimeout(() => {
      setDiagRunning(false);
      recordCustomAction(
        'システムヘルス診断・接続テスト完了',
        '基幹DB (3.4ms) / 国税庁インボイスAPI / 全銀EDIゲートウェイ すべて正常',
        'DIAG-2026',
        '模擬ステータス (デモ表示)'
      );
    }, 600);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `SUP-2026-0${Math.floor(890 + Math.random() * 90)}`;
    recordCustomAction(
      `サポートチケット発行: #${ticketId}`,
      `件名: ${ticketSubject} (担当: デモ用デスク (模擬))`,
      ticketId,
      `Ticket #${ticketId} 受付完了`
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Support Button in Bottom-Right Corner */}
      <div className="fixed bottom-4 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-blue-950 text-white border border-slate-700 shadow-xl transition-all"
          >
            <div className="relative">
              <Headphones className="w-4 h-4 text-blue-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="text-left leading-tight pr-1">
              <div className="text-[11px] font-bold tracking-wide">
                サポート窓口 / {t('Support Desk', 'Suporte 24/7')}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                デモ用デスク (模擬)
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Support Concierge Popup */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-96 sm:w-[410px] bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>KIZUNA エンタープライズ・サポート</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400">
                  {t(
                    'Demo support desk (simulated)',
                    'Suporte de demonstração (simulado)'
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtabs */}
          <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`py-2 text-center border-b-2 ${
                activeTab === 'CHAT'
                  ? 'bg-white border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              💬 専任チャット
            </button>
            <button
              onClick={() => setActiveTab('DIAG')}
              className={`py-2 text-center border-b-2 ${
                activeTab === 'DIAG'
                  ? 'bg-white border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🩺 稼働診断
            </button>
            <button
              onClick={() => setActiveTab('TICKET')}
              className={`py-2 text-center border-b-2 ${
                activeTab === 'TICKET'
                  ? 'bg-white border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              🎫 チケット発行
            </button>
          </div>

          {/* TAB 1: CHAT */}
          {activeTab === 'CHAT' && (
            <div className="flex flex-col h-80">
              {/* Quick FAQ Chips */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={() => askQuickFaq('AR')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-blue-600 text-slate-700 shrink-0"
                >
                  売掛金・会計連携
                </button>
                <button
                  onClick={() => askQuickFaq('HANKO')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-blue-600 text-slate-700 shrink-0"
                >
                  電子印鑑・稟議承認
                </button>
                <button
                  onClick={() => askQuickFaq('CMD')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-blue-600 text-slate-700 shrink-0"
                >
                  統合検索 (⌘K)
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40 text-xs">
                {chatLog.map((item, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      item.sender === 'USER' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-md p-2.5 border ${
                        item.sender === 'USER'
                          ? 'bg-slate-900 text-white border-slate-800'
                          : 'bg-white text-slate-800 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="text-[11px] leading-relaxed">{item.textJp}</div>
                      {item.textSub !== item.textJp && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item.textSub}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendChat}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t(
                    'Type a message to Support Desk...',
                    'Digite sua dúvida para o suporte...'
                  )}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-blue-800"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: DIAGNOSTICS */}
          {activeTab === 'DIAG' && (
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>全モジュール正常稼働中 (All Systems Nominal)</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700">DEMO</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded border border-slate-200">
                  <span>東京本社 プライマリDB応答</span>
                  <span className="text-emerald-700 font-bold">3.4 ms (OK)</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded border border-slate-200">
                  <span>国税庁 適格請求書API連携</span>
                  <span className="text-emerald-700 font-bold">CONNECTED</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded border border-slate-200">
                  <span>全銀EDI・ファームバンキング</span>
                  <span className="text-emerald-700 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 bg-slate-50 rounded border border-slate-200">
                  <span>電帳法 認定タイムスタンプ局</span>
                  <span className="text-emerald-700 font-bold">VERIFIED</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleRunDiagnostics}
                  disabled={diagRunning}
                  className="w-full py-2 rounded bg-slate-900 hover:bg-blue-900 text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {diagRunning
                      ? '診断パケット送信中...'
                      : t('Run Live System Diagnostics', 'Executar Diagnóstico Ao Vivo')}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveModule('ai');
                  }}
                  className="w-full py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                  <span>Kizuna AI 経営参謀を開く</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CREATE SUPPORT TICKET */}
          {activeTab === 'TICKET' && (
            <form onSubmit={handleCreateTicket} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  優先度 / Priority Level
                </label>
                <select className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold">
                  <option>通常問い合わせ (デモ)</option>
                  <option>優先対応 (High Priority - 30m)</option>
                  <option>緊急・決算日対応 (Critical Executive - 5m)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  件名・対象モジュール / Subject
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-800 shrink-0" />
                <span>直通ホットライン: 0120-842-900 (24時間365日 有人対応)</span>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold"
              >
                サポートチケットを発行 ({t('Submit Ticket', 'Emitir Chamado')})
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};
