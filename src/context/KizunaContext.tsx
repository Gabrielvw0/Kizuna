import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BranchId,
  SubLang,
  ModuleId,
  RecordType,
  Partner,
  SalesOrder,
  InvoiceRecord,
  JournalEntry,
  PurchaseRequest,
  InventoryItem,
  DocumentItem,
  AuditLogEntry,
  EmployeeRecord,
  ActivityRecord,
  ActivityStatus,
  ProjectRecord,
} from '../types/erp';
import {
  DEMO_TODAY,
  INITIAL_ACTIVITIES,
  INITIAL_PROJECTS,
  TEAM_MEMBERS,
} from '../data/startActivitiesData';
import {
  BRANCHES,
  BranchInfo,
  INITIAL_PARTNERS,
  INITIAL_SALES_ORDERS,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_INVENTORY,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EMPLOYEES,
} from '../data/initialErpData';

export interface ToastNotification {
  id: string;
  titleJp: string;
  subtitle: string;
  metricsDelta?: string;
}

interface KizunaContextType {
  // Navigation & localization
  activeModule: ModuleId;
  setActiveModule: (mod: ModuleId) => void;
  activeBranch: BranchId;
  setActiveBranch: (branch: BranchId) => void;
  currentBranchInfo: BranchInfo;
  subLang: SubLang;
  setSubLang: (lang: SubLang) => void;
  t: (en: string, pt: string) => string;

  // Core ERP Entities
  partners: Partner[];
  salesOrders: SalesOrder[];
  invoices: InvoiceRecord[];
  journalEntries: JournalEntry[];
  purchaseRequests: PurchaseRequest[];
  inventory: InventoryItem[];
  documents: DocumentItem[];
  auditLogs: AuditLogEntry[];
  employees: EmployeeRecord[];
  activities: ActivityRecord[];
  projects: ProjectRecord[];

  // Computed / Reactive Executive KPIs
  kpis: {
    revenue: number; // Base ¥284,600,000
    operatingProfit: number; // Base ¥42,800,000
    inventoryValue: number; // Base ¥68,400,000
    accountsReceivable: number; // Base ¥12,700,000
    accountsPayable: number; // Base ¥9,840,000 -> ¥12,680,000 on PR approval
    backlog: number; // Base ¥34,200,000
    cashFlow: number; // Base ¥18,600,000
    activePoCount: number; // Base 24 -> 25 on PR approval
    pendingApprovalsCount: number; // Base 3 -> 2 on PR approval
    lowStockCount: number; // Base 3 items require attention
  };

  // Global Overlays / Drawers / Command Center
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean, initialQuery?: string) => void;
  commandQuery: string;
  setCommandQuery: (q: string) => void;

  selectedPartnerId: string | null;
  setSelectedPartnerId: (id: string | null) => void;

  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;

  selectedPrId: string | null;
  setSelectedPrId: (id: string | null) => void;

  highlightedJeId: string | null;
  setHighlightedJeId: (id: string | null) => void;

  isArDrilldownOpen: boolean;
  setIsArDrilldownOpen: (open: boolean) => void;

  isDemoPanelOpen: boolean;
  setIsDemoPanelOpen: (open: boolean) => void;

  toast: ToastNotification | null;
  dismissToast: () => void;
  showToast: (titleJp: string, subtitle: string, metricsDelta?: string) => void;

  // Universal relational navigation
  openRecord: (type: RecordType, id: string) => void;

  // Vertical Slice Reactive Actions
  syncOrderToAccounting: (orderId: string) => void;
  approvePurchaseRequest: (prId: string) => void;
  advanceJournalEntryStep: (jeId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  triggerReplenishment: (itemCode: string) => void;
  createSalesOrder: (partnerId: string, itemsJp: string, amount: number) => void;
  createPurchaseRequest: (supplierId: string, titleJp: string, amount: number, deptJp: string) => void;
  stampDocument: (docId: string, kanji?: string) => void;
  recordCustomAction: (actionJp: string, detailJp: string, targetId?: string, metricsDelta?: string) => void;
  resetDemoState: () => void;

  // Kizuna Start: atividades e projetos (dados fictícios)
  createActivity: (input: {
    title: string;
    assigneeId: string;
    dueDate: string;
    projectId: string | null;
  }) => boolean;
  setActivityStatus: (id: string, status: ActivityStatus) => void;
  assignActivity: (id: string, assigneeId: string) => void;
  setActivityDueDate: (id: string, dueDate: string) => void;
  setActivityProject: (id: string, projectId: string | null) => void;
}

const KizunaContext = createContext<KizunaContextType | undefined>(undefined);

const STORAGE_KEY = 'kizuna_erp_state_v2';

export const KizunaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('activities');
  const [activeBranch, setActiveBranch] = useState<BranchId>('ALL');
  const [subLang, setSubLang] = useState<SubLang>('EN');

  // Entities state
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(INITIAL_PURCHASE_REQUESTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [employees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [activities, setActivities] = useState<ActivityRecord[]>(INITIAL_ACTIVITIES);
  const [projects] = useState<ProjectRecord[]>(INITIAL_PROJECTS);

  // Delta accumulators for live executive presentation impact
  const [revenueDelta, setRevenueDelta] = useState<number>(0);
  const [arDelta, setArDelta] = useState<number>(0);
  const [apDelta, setApDelta] = useState<number>(0);
  const [poCountDelta, setPoCountDelta] = useState<number>(0);

  // Drawers & Modals
  const [isCommandOpen, setIsCommandOpenState] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedPrId, setSelectedPrId] = useState<string | null>('PR-2026-00842');
  const [highlightedJeId, setHighlightedJeId] = useState<string | null>(null);
  const [isArDrilldownOpen, setIsArDrilldownOpen] = useState<boolean>(false);
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K for Command Center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpenState((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpenState(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const t = (en: string, pt: string) => (subLang === 'EN' ? en : pt);

  const currentBranchInfo =
    BRANCHES.find((b) => b.id === activeBranch) || BRANCHES[0];

  const showToast = (titleJp: string, subtitle: string, metricsDelta?: string) => {
    const id = String(Date.now());
    setToast({ id, titleJp, subtitle, metricsDelta });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 6000);
  };

  const dismissToast = () => setToast(null);

  const setCommandOpen = (open: boolean, initialQuery?: string) => {
    if (initialQuery !== undefined) {
      setCommandQuery(initialQuery);
    }
    setIsCommandOpenState(open);
  };

  const getNowTimeStr = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
  };

  // Computed KPIs scaled by branch multiplier (1.0 for ALL)
  const mult = currentBranchInfo.multiplier;
  const pendingApprovalsCount = purchaseRequests.filter(
    (pr) => pr.status === 'PENDING_APPROVAL' && (activeBranch === 'ALL' || pr.branch === activeBranch)
  ).length;

  const lowStockCount = inventory.filter(
    (item) =>
      (item.status === 'WARNING' || item.status === 'OUT_OF_STOCK') &&
      (activeBranch === 'ALL' || item.branch === activeBranch)
  ).length;

  const kpis = {
    revenue: Math.round((284600000 + revenueDelta) * mult),
    operatingProfit: Math.round((42800000 + revenueDelta * 0.18) * mult),
    inventoryValue: Math.round(68400000 * mult),
    accountsReceivable: Math.round((12700000 + arDelta) * mult),
    accountsPayable: Math.round((9840000 + apDelta) * mult),
    backlog: Math.round(34200000 * mult),
    cashFlow: Math.round(18600000 * mult),
    activePoCount: Math.max(1, Math.round(24 * mult) + poCountDelta),
    pendingApprovalsCount,
    lowStockCount,
  };

  // Universal Record Opener
  const openRecord = (type: RecordType, id: string) => {
    setIsCommandOpenState(false);
    setIsArDrilldownOpen(false);

    if (type === 'PARTNER') {
      setSelectedPartnerId(id);
      return;
    }
    if (type === 'SO') {
      setSelectedOrderId(id);
      return;
    }
    if (type === 'INV' || type === 'PAYMENT') {
      const inv = invoices.find((i) => i.id === id || i.paymentId === id);
      if (inv) {
        setSelectedOrderId(inv.salesOrderId);
      } else {
        setSelectedOrderId('SO-2026-10482');
      }
      return;
    }
    if (type === 'CONTRACT' || type === 'DOC') {
      setSelectedDocId(id);
      return;
    }
    if (type === 'JE') {
      setSelectedPartnerId(null);
      setSelectedOrderId(null);
      setHighlightedJeId(id);
      setActiveModule('accounting');
      return;
    }
    if (type === 'PR' || type === 'PO') {
      const pr = purchaseRequests.find((p) => p.id === id || p.poNumber === id);
      const targetPrId = pr ? pr.id : 'PR-2026-00842';
      setSelectedPrId(targetPrId);
      setSelectedPartnerId(null);
      setSelectedOrderId(null);
      setActiveModule('workflow');
      return;
    }
    if (type === 'ITEM') {
      setSelectedPartnerId(null);
      setSelectedOrderId(null);
      setActiveModule('inventory');
      return;
    }
    if (type === 'EMP') {
      setSelectedPartnerId(null);
      setSelectedOrderId(null);
      setActiveModule('hr');
      return;
    }
  };

  // Vertical Slice 1: Order-to-Cash Accounting Integration
  const syncOrderToAccounting = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;

    const newJeId = order.journalEntryId || `JE-2026-0284${journalEntries.length + 1}`;

    // Update order & invoice state
    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              accountingSynced: true,
              stage: 'INVOICED',
              statusJp: '売上・売掛計上済',
              statusEn: 'Posted to GL (AR)',
              statusPt: 'Contabilizado no Razão (AR)',
              journalEntryId: newJeId,
            }
          : o
      )
    );

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.salesOrderId === orderId
          ? {
              ...inv,
              accountingSynced: true,
              journalEntryId: newJeId,
              status: 'OPEN_AR',
              statusJp: '売掛計上済 (会計連携完了)',
              statusEn: 'Posted to AR Ledger',
              statusPt: 'Contabilizado em Contas a Receber',
            }
          : inv
      )
    );

    // Add or move journal entry to top
    const existingJe = journalEntries.find((j) => j.id === newJeId);
    if (!existingJe) {
      const createdJe: JournalEntry = {
        id: newJeId,
        date: '10/21',
        branch: order.branch,
        debitAccountJp: '売掛金',
        debitAccountEn: 'Accounts Receivable',
        debitAccountPt: 'Contas a Receber',
        creditAccountJp: '売上高',
        creditAccountEn: 'Sales Revenue',
        creditAccountPt: 'Receita de Vendas',
        amount: order.amount,
        summaryJp: `${order.partnerNameJp} 請求書 #${order.invoiceId} (注文 #${order.id}) 自動仕訳連携`,
        summaryEn: `${order.partnerNameEn} Invoice #${order.invoiceId} (Order #${order.id}) Auto-GL Sync`,
        summaryPt: `${order.partnerNameEn} Fatura #${order.invoiceId} (Pedido #${order.id}) Integração Contábil`,
        workflowStep: 'POSTED',
        relatedDocId: order.invoiceId,
        partnerId: order.partnerId,
        approvedByStamp: '佐藤',
      };
      setJournalEntries((prev) => [createdJe, ...prev]);
    }

    // Increment Executive KPIs so returning to Dashboard visibly shows the change!
    setRevenueDelta((prev) => prev + order.amount);
    setArDelta((prev) => prev + order.amount);

    // Update Partner receivable balance if it wasn't already added
    setPartners((prev) =>
      prev.map((p) =>
        p.id === order.partnerId
          ? {
              ...p,
              receivableBalance: order.accountingSynced
                ? p.receivableBalance
                : p.receivableBalance + order.amount,
              journalEntries: p.journalEntries.includes(newJeId)
                ? p.journalEntries
                : [newJeId, ...p.journalEntries],
            }
          : p
      )
    );

    // Append live Audit Log
    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: '営業部 → 経理部',
      targetId: order.invoiceId,
      actionJp: `会計連携実行: ${order.invoiceId} → 仕訳 #${newJeId}`,
      actionEn: `Accounting Integration Executed: ${order.invoiceId} → Journal #${newJeId}`,
      actionPt: `Integração Contábil Executada: ${order.invoiceId} → Lançamento #${newJeId}`,
      detailJp: `借方: 売掛金 ¥${order.amount.toLocaleString()} / 貸方: 売上高 ¥${order.amount.toLocaleString()} (${order.partnerNameJp})`,
      detailEn: `Dr: Accounts Receivable ¥${order.amount.toLocaleString()} / Cr: Sales Revenue ¥${order.amount.toLocaleString()}`,
      detailPt: `Débito: Contas a Receber ¥${order.amount.toLocaleString()} / Crédito: Receita de Vendas ¥${order.amount.toLocaleString()}`,
      severity: 'FINANCIAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setHighlightedJeId(newJeId);
    showToast(
      '✓ 会計システムへ仕訳を連携しました',
      subLang === 'EN'
        ? `Posted Dr: Accounts Receivable / Cr: Sales Revenue (¥${order.amount.toLocaleString()})`
        : `Lançado Débito: Contas a Receber / Crédito: Receita (¥${order.amount.toLocaleString()})`,
      `未回収債権 +¥${(order.amount / 1000000).toFixed(2)}M | 売上高 +¥${(order.amount / 1000000).toFixed(2)}M`
    );
  };

  // Vertical Slice 2: The "Wow Moment" — Approve PR / Ringi Workflow
  const approvePurchaseRequest = (prId: string) => {
    const pr = purchaseRequests.find((p) => p.id === prId);
    if (!pr || pr.status !== 'PENDING_APPROVAL') return;

    const nowTime = getNowTimeStr().slice(0, 5);

    setPurchaseRequests((prev) =>
      prev.map((item) => {
        if (item.id !== prId) return item;
        return {
          ...item,
          status: 'APPROVED_ORDERED',
          statusJp: '承認済・発注完了',
          statusEn: 'Approved & PO Dispatched',
          statusPt: 'Aprovado e Pedido Emitido',
          steps: item.steps.map((s) => {
            if (s.key === 'DEPT_APPROVAL' || s.key === 'PROC_APPROVAL') {
              return {
                ...s,
                state: 'DONE',
                actorJp: '山田 太郎',
                timestamp: `10/21 ${nowTime}`,
                stampKanji: '山田',
              };
            }
            if (s.key === 'PO_ISSUED') {
              return {
                ...s,
                state: 'DONE',
                actorJp: '自動EDI発注',
                timestamp: `10/21 ${nowTime}`,
                stampKanji: '購買',
              };
            }
            if (s.key === 'RECEIVED') {
              return {
                ...s,
                state: 'CURRENT',
              };
            }
            return s;
          }),
        };
      })
    );

    // Update Document stamp if PR exists in Documents
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === prId
          ? {
              ...doc,
              status: 'VALID',
              statusJp: '決裁完了・発注済',
              statusEn: 'Approved & Issued',
              statusPt: 'Aprovado e Emitido',
              stamps: doc.stamps.includes('山田') ? doc.stamps : [...doc.stamps, '山田'],
            }
          : doc
      )
    );

    // Update Inventory incoming stock if linked to an item (e.g. KZ-00882)
    if (pr.relatedItemCode) {
      setInventory((prev) =>
        prev.map((item) =>
          item.code === pr.relatedItemCode
            ? {
                ...item,
                incoming: item.incoming + 80,
              }
            : item
        )
      );
    }

    // Create corresponding AP Journal Entry
    const newJeId = `JE-2026-0284${journalEntries.length + 2}`;
    const newJe: JournalEntry = {
      id: newJeId,
      date: '10/21',
      branch: pr.branch,
      debitAccountJp: '仕入高',
      debitAccountEn: 'Purchases / Materials',
      debitAccountPt: 'Compras de Materiais',
      creditAccountJp: '買掛金',
      creditAccountEn: 'Accounts Payable',
      creditAccountPt: 'Contas a Pagar',
      amount: pr.amount,
      summaryJp: `${pr.supplierNameJp} 発注承認 #${pr.poNumber || pr.id} 買掛計上`,
      summaryEn: `${pr.supplierNameEn} Approved PO #${pr.poNumber || pr.id} AP Accrual`,
      summaryPt: `${pr.supplierNameEn} Pedido Aprovado #${pr.poNumber || pr.id} Contas a Pagar`,
      workflowStep: 'POSTED',
      relatedDocId: pr.id,
      partnerId: pr.supplierId,
      approvedByStamp: '山田',
    };
    setJournalEntries((prev) => [newJe, ...prev]);

    // Update Partner payable balance
    setPartners((prev) =>
      prev.map((ptn) =>
        ptn.id === pr.supplierId
          ? {
              ...ptn,
              payableBalance: ptn.payableBalance + pr.amount,
              journalEntries: [newJeId, ...ptn.journalEntries],
            }
          : ptn
      )
    );

    // Update Executive KPI deltas:
    // AP: ¥9.84M -> ¥12.68M (+¥2.84M)
    // PO count: 24 -> 25 (+1)
    setApDelta((prev) => prev + pr.amount);
    setPoCountDelta((prev) => prev + 1);

    // Add live Audit Log entry
    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: '購買統括・ワークフロー',
      targetId: pr.id,
      actionJp: `稟議承認・発注実行: #${pr.id} (${pr.poNumber || 'PO'})`,
      actionEn: `Ringi Approved & PO Dispatched: #${pr.id} (¥${pr.amount.toLocaleString()})`,
      actionPt: `Ringi Aprovado e Pedido Emitido: #${pr.id} (¥${pr.amount.toLocaleString()})`,
      detailJp: `${pr.supplierNameJp} 向け発注承認。買掛金 +¥${pr.amount.toLocaleString()} を計上、電子印鑑(山田)押印済。`,
      detailEn: `Approved PO to ${pr.supplierNameEn}. AP increased by ¥${pr.amount.toLocaleString()}, Digital Hanko stamped.`,
      detailPt: `Pedido aprovado para ${pr.supplierNameEn}. Contas a Pagar +¥${pr.amount.toLocaleString()}, Hanko digital aplicado.`,
      severity: 'APPROVAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    const remainingPending = Math.max(0, pendingApprovalsCount - 1);
    showToast(
      '✓ ワークフローが正常に完了しました',
      subLang === 'EN'
        ? `Approved ${pr.id} (${pr.supplierNameEn}) — Digital Hanko Stamped`
        : `Aprovado ${pr.id} (${pr.supplierNameEn}) — Carimbo Hanko Aplicado`,
      `承認待ち ${pendingApprovalsCount}→${remainingPending} | 買掛金 +¥${(pr.amount / 1000000).toFixed(2)}M | 発注 +1 | Audit Log +1`
    );
  };

  // Advance Journal Entry workflow step (保存 -> 確認 -> 承認 -> 登録)
  const advanceJournalEntryStep = (jeId: string) => {
    const order: JournalEntry['workflowStep'][] = ['SAVED', 'VERIFIED', 'APPROVED', 'POSTED'];
    setJournalEntries((prev) =>
      prev.map((je) => {
        if (je.id !== jeId) return je;
        const idx = order.indexOf(je.workflowStep);
        const nextStep = order[Math.min(order.length - 1, idx + 1)];
        return { ...je, workflowStep: nextStep };
      })
    );
    showToast(
      '✓ 仕訳伝票のステータスを更新しました',
      subLang === 'EN'
        ? `Journal Entry ${jeId} workflow advanced`
        : `Etapa do lançamento contábil ${jeId} avançada`
    );
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newId = `JE-2026-0284${journalEntries.length + 2}`;
    const fullEntry: JournalEntry = { ...entry, id: newId };
    setJournalEntries((prev) => [fullEntry, ...prev]);

    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '佐藤 美咲',
      actorRomaji: 'Misaki Sato',
      departmentJp: '経理部',
      targetId: newId,
      actionJp: `新規仕訳入力: #${newId} (¥${entry.amount.toLocaleString()})`,
      actionEn: `New Journal Entry Created: #${newId} (¥${entry.amount.toLocaleString()})`,
      actionPt: `Novo Lançamento Contábil: #${newId} (¥${entry.amount.toLocaleString()})`,
      detailJp: `借方: ${entry.debitAccountJp} / 貸方: ${entry.creditAccountJp} — ${entry.summaryJp}`,
      detailEn: `Dr: ${entry.debitAccountEn} / Cr: ${entry.creditAccountEn}`,
      detailPt: `Débito: ${entry.debitAccountPt} / Crédito: ${entry.creditAccountPt}`,
      severity: 'FINANCIAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
    showToast(
      `✓ 仕訳伝票 #${newId} を登録しました`,
      `${entry.debitAccountJp} / ${entry.creditAccountJp} ¥${entry.amount.toLocaleString()}`
    );
  };

  const triggerReplenishment = (itemCode: string) => {
    const target = inventory.find((i) => i.code === itemCode);
    if (!target) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.code === itemCode
          ? {
              ...item,
              incoming: item.incoming + 100,
              status: item.stock === 0 ? 'WARNING' : 'NORMAL',
            }
          : item
      )
    );

    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '鈴木 健二',
      actorRomaji: 'Kenji Suzuki',
      departmentJp: '購買部・在庫管理',
      targetId: itemCode,
      actionJp: `緊急補充手配: ${itemCode} (${target.nameJp}) +100個`,
      actionEn: `Urgent Replenishment Triggered: ${itemCode} (+100 units incoming)`,
      actionPt: `Reposição Urgente Acionada: ${itemCode} (+100 un. em trânsito)`,
      detailJp: `${target.warehouseJp}倉庫向け補充オーダーを ${target.supplierNameJp} へ送信完了`,
      detailEn: `Replenishment order dispatched to ${target.supplierNameJp} for ${target.warehouseEn} Warehouse`,
      detailPt: `Pedido de reposição enviado para ${target.supplierNameJp} (${target.warehouseJp})`,
      severity: 'INFO',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      `✓ 緊急発注・在庫補充を手配しました (${itemCode})`,
      subLang === 'EN'
        ? `Dispatched +100 units replenishment order for ${target.nameEn}`
        : `Ordem de reposição (+100 un.) gerada para ${target.namePt}`,
      `入荷予定 +100 | Audit Log +1`
    );
  };

  const createSalesOrder = (partnerId: string, itemsJp: string, amount: number) => {
    const ptn = partners.find((p) => p.id === partnerId) || partners[0];
    const newOrderNum = 10492 + salesOrders.length;
    const newInvNum = 396 + invoices.length;
    const newOrderId = `SO-2026-${newOrderNum}`;
    const newInvId = `INV-2026-00${newInvNum}`;

    const newOrder: SalesOrder = {
      id: newOrderId,
      partnerId: ptn.id,
      partnerNameJp: ptn.nameJp,
      partnerNameEn: ptn.nameEn,
      branch: ptn.branch === 'ALL' ? 'TOKYO' : ptn.branch,
      date: '2026年10月21日',
      deliveryDate: '2026年11月10日',
      amount,
      stage: 'ORDER',
      statusJp: '受注確定 (未連携)',
      statusEn: 'Order Confirmed (Unposted)',
      statusPt: 'Pedido Confirmado (Pendente Contábil)',
      itemsSummaryJp: itemsJp,
      itemsSummaryEn: itemsJp,
      salesRepJp: '山田 太郎',
      invoiceId: newInvId,
      contractId: ptn.contracts[0] || 'CT-2026-0841',
      accountingSynced: false,
    };

    const newInvoice: InvoiceRecord = {
      id: newInvId,
      salesOrderId: newOrderId,
      partnerId: ptn.id,
      partnerNameJp: ptn.nameJp,
      partnerNameEn: ptn.nameEn,
      contractId: ptn.contracts[0] || 'CT-2026-0841',
      branch: ptn.branch === 'ALL' ? 'TOKYO' : ptn.branch,
      issueDate: '2026年10月21日',
      dueDate: '2026年11月30日',
      amount,
      taxAmount: Math.round(amount * 0.1),
      status: 'PENDING_SYNC',
      statusJp: '会計未連携',
      statusEn: 'Pending Accounting Sync',
      statusPt: 'Pendente Integração Contábil',
      accountingSynced: false,
    };

    setSalesOrders((prev) => [newOrder, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);

    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: '営業部',
      targetId: newOrderId,
      actionJp: `新規受注登録: #${newOrderId} (${ptn.nameJp})`,
      actionEn: `New Sales Order Created: #${newOrderId} (¥${amount.toLocaleString()})`,
      actionPt: `Novo Pedido de Venda Criado: #${newOrderId} (¥${amount.toLocaleString()})`,
      detailJp: `${itemsJp} — 請求書 #${newInvId} を同時生成`,
      detailEn: `Generated linked invoice #${newInvId}`,
      detailPt: `Fatura vinculada #${newInvId} gerada automaticamente`,
      severity: 'FINANCIAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      `✓ 新規受注 #${newOrderId} を登録しました`,
      `${ptn.nameJp} — ¥${amount.toLocaleString()} (請求書 #${newInvId} 生成済)`,
      `受注残高 +¥${(amount / 1000000).toFixed(2)}M | Audit Log +1`
    );
  };

  const createPurchaseRequest = (
    supplierId: string,
    titleJp: string,
    amount: number,
    deptJp: string
  ) => {
    const sup = partners.find((p) => p.id === supplierId) || partners[1];
    const num = 846 + purchaseRequests.length;
    const newPrId = `PR-2026-00${num}`;
    const newPoId = `PO-2026-00${num}`;
    const nowTime = getNowTimeStr().slice(0, 5);

    const newPr: PurchaseRequest = {
      id: newPrId,
      requesterJp: '山田 太郎',
      requesterRomaji: 'Taro Yamada',
      departmentJp: deptJp,
      departmentEn: deptJp,
      departmentPt: deptJp,
      supplierId: sup.id,
      supplierNameJp: sup.nameJp,
      supplierNameEn: sup.nameEn,
      branch: sup.branch === 'ALL' ? 'TOKYO' : sup.branch,
      date: '2026年10月21日',
      amount,
      titleJp,
      titleEn: titleJp,
      titlePt: titleJp,
      status: 'PENDING_APPROVAL',
      statusJp: '購買承認待ち',
      statusEn: 'Pending Approval',
      statusPt: 'Aguardando Aprovação',
      poNumber: newPoId,
      steps: [
        {
          key: 'REQUEST',
          labelJp: '申請',
          labelEn: 'Request Submitted',
          labelPt: 'Solicitação',
          state: 'DONE',
          actorJp: '山田 太郎',
          timestamp: `10/21 ${nowTime}`,
          stampKanji: '山田',
        },
        {
          key: 'DEPT_APPROVAL',
          labelJp: '部門承認',
          labelEn: 'Department Approval',
          labelPt: 'Aprovação Departamental',
          state: 'CURRENT',
          actorJp: '鈴木 健二',
        },
        {
          key: 'PROC_APPROVAL',
          labelJp: '購買承認',
          labelEn: 'Procurement Approval',
          labelPt: 'Aprovação de Compras',
          state: 'PENDING',
        },
        {
          key: 'PO_ISSUED',
          labelJp: '発注',
          labelEn: 'PO Dispatch',
          labelPt: 'Emissão de Pedido',
          state: 'PENDING',
        },
        {
          key: 'RECEIVED',
          labelJp: '入荷',
          labelEn: 'Goods Receipt',
          labelPt: 'Recebimento',
          state: 'PENDING',
        },
      ],
    };

    setPurchaseRequests((prev) => [newPr, ...prev]);
    setSelectedPrId(newPrId);

    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: deptJp,
      targetId: newPrId,
      actionJp: `新規購買稟議起票: #${newPrId} (¥${amount.toLocaleString()})`,
      actionEn: `New Purchase Request Submitted: #${newPrId}`,
      actionPt: `Nova Requisição de Compra Criada: #${newPrId}`,
      detailJp: `${sup.nameJp} — ${titleJp}`,
      detailEn: `${sup.nameEn} — ${titleJp}`,
      detailPt: `${sup.nameEn} — ${titleJp}`,
      severity: 'APPROVAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      `✓ 購買稟議 #${newPrId} を起票しました`,
      `${sup.nameJp} (¥${amount.toLocaleString()}) — ワークフロー承認待ちに追加`,
      `承認待ち +1 | Audit Log +1`
    );
  };

  const stampDocument = (docId: string, kanji = '山田') => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'VALID',
              statusJp: '電子印鑑押印・有効',
              stamps: d.stamps.includes(kanji) ? d.stamps : [...d.stamps, kanji],
            }
          : d
      )
    );

    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: '文書管理・法務',
      targetId: docId,
      actionJp: `電子印鑑 (${kanji}) 押印・タイムスタンプ付与: #${docId}`,
      actionEn: `Digital Hanko (${kanji}) Stamped on Document #${docId}`,
      actionPt: `Carimbo Hanko (${kanji}) Aplicado no Documento #${docId}`,
      detailJp: '電子帳簿保存法準拠 SHA-256 署名更新完了',
      detailEn: 'Electronic Bookkeeping Act SHA-256 signature updated',
      detailPt: 'Assinatura digital SHA-256 atualizada com sucesso',
      severity: 'APPROVAL',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      `✓ 文書 #${docId} に電子印鑑 (${kanji}) を押印しました`,
      subLang === 'EN'
        ? 'Digital Hanko seal applied (demo).'
        : 'Carimbo Hanko digital aplicado (demonstração).',
      `電子印鑑 +1 | Audit Log +1`
    );
  };

  const recordCustomAction = (
    actionJp: string,
    detailJp: string,
    targetId = 'SYS-ERP',
    metricsDelta?: string
  ) => {
    const newAudit: AuditLogEntry = {
      id: `AUD-${905 + auditLogs.length}`,
      time: getNowTimeStr(),
      date: '2026年10月21日',
      actorJp: '山田 太郎',
      actorRomaji: 'Taro Yamada',
      departmentJp: '経営統括本部',
      targetId,
      actionJp,
      actionEn: actionJp,
      actionPt: actionJp,
      detailJp,
      detailEn: detailJp,
      detailPt: detailJp,
      severity: 'INFO',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
    showToast(`✓ ${actionJp}`, detailJp, metricsDelta || 'Audit Log +1');
  };

  // ---- Kizuna Start: atividades. Cada mudança grava uma linha na trilha de auditoria. ----
  const logActivityAudit = (
    targetId: string,
    actionJp: string,
    actionEn: string,
    actionPt: string,
    detail: string
  ) => {
    const time = getNowTimeStr();
    setAuditLogs((prev) => [
      {
        id: `AUD-${905 + prev.length}`,
        time,
        date: '2026年10月21日',
        actorJp: '山田 太郎',
        actorRomaji: 'Taro Yamada',
        departmentJp: 'Kizuna Start・アクティビティ',
        targetId,
        actionJp,
        actionEn,
        actionPt,
        detailJp: detail,
        detailEn: detail,
        detailPt: detail,
        severity: 'INFO',
      },
      ...prev,
    ]);
  };

  const memberName = (id: string) => TEAM_MEMBERS.find((m) => m.id === id)?.nameRomaji ?? id;

  const createActivity: KizunaContextType['createActivity'] = ({ title, assigneeId, dueDate, projectId }) => {
    const cleanTitle = title.trim();
    if (!cleanTitle || !assigneeId || !dueDate) return false;
    const newId = `ATV-${String(activities.length + 1).padStart(4, '0')}`;
    setActivities((prev) => [
      { id: newId, title: cleanTitle, assigneeId, dueDate, status: 'TODO', projectId, createdAt: DEMO_TODAY },
      ...prev,
    ]);
    logActivityAudit(
      newId,
      `アクティビティ登録: ${newId}`,
      `Activity created: ${newId}`,
      `Atividade criada: ${newId}`,
      `"${cleanTitle}" → ${memberName(assigneeId)}, prazo ${dueDate}${projectId ? `, projeto ${projectId}` : ''}`
    );
    showToast(`✓ Atividade ${newId} criada`, `${cleanTitle} — responsável: ${memberName(assigneeId)}, prazo ${dueDate}`, 'Audit Log +1');
    return true;
  };

  const setActivityStatus: KizunaContextType['setActivityStatus'] = (id, status) => {
    const cur = activities.find((a) => a.id === id);
    if (!cur || cur.status === status) return;
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, completedAt: status === 'DONE' ? DEMO_TODAY : undefined }
          : a
      )
    );
    logActivityAudit(
      id,
      `ステータス変更: ${id}`,
      `Status changed: ${id}`,
      `Status alterado: ${id}`,
      `${cur.status} → ${status} (${cur.title})`
    );
  };

  const assignActivity: KizunaContextType['assignActivity'] = (id, assigneeId) => {
    const cur = activities.find((a) => a.id === id);
    if (!cur || cur.assigneeId === assigneeId) return;
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, assigneeId } : a)));
    logActivityAudit(
      id,
      `担当者変更: ${id}`,
      `Assignee changed: ${id}`,
      `Responsável alterado: ${id}`,
      `${memberName(cur.assigneeId)} → ${memberName(assigneeId)} (${cur.title})`
    );
  };

  const setActivityDueDate: KizunaContextType['setActivityDueDate'] = (id, dueDate) => {
    const cur = activities.find((a) => a.id === id);
    if (!cur || !dueDate || cur.dueDate === dueDate) return;
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, dueDate } : a)));
    logActivityAudit(
      id,
      `期限変更: ${id}`,
      `Due date changed: ${id}`,
      `Prazo alterado: ${id}`,
      `${cur.dueDate} → ${dueDate} (${cur.title})`
    );
  };

  const setActivityProject: KizunaContextType['setActivityProject'] = (id, projectId) => {
    const cur = activities.find((a) => a.id === id);
    if (!cur || cur.projectId === projectId) return;
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, projectId } : a)));
    logActivityAudit(
      id,
      `プロジェクト紐付け変更: ${id}`,
      `Project link changed: ${id}`,
      `Vínculo de projeto alterado: ${id}`,
      `${cur.projectId ?? 'sem projeto'} → ${projectId ?? 'sem projeto'} (${cur.title})`
    );
  };

  const resetDemoState = () => {
    setActivities(INITIAL_ACTIVITIES);
    setPartners(INITIAL_PARTNERS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setInventory(INITIAL_INVENTORY);
    setDocuments(INITIAL_DOCUMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRevenueDelta(0);
    setArDelta(0);
    setApDelta(0);
    setPoCountDelta(0);
    setActiveBranch('ALL');
    setSelectedPartnerId(null);
    setSelectedOrderId(null);
    setSelectedDocId(null);
    setHighlightedJeId(null);
    setIsArDrilldownOpen(false);
    localStorage.removeItem(STORAGE_KEY);
    showToast(
      '✓ デモ環境を初期状態にリセットしました',
      subLang === 'EN'
        ? 'All KPIs, workflows, and ledgers restored to presentation baseline.'
        : 'Todos os KPIs, aprovações e lançamentos voltaram ao estado inicial da apresentação.'
    );
  };

  return (
    <KizunaContext.Provider
      value={{
        activeModule,
        setActiveModule,
        activeBranch,
        setActiveBranch,
        currentBranchInfo,
        subLang,
        setSubLang,
        t,
        partners,
        salesOrders,
        invoices,
        journalEntries,
        purchaseRequests,
        inventory,
        documents,
        auditLogs,
        employees,
        activities,
        projects,
        createActivity,
        setActivityStatus,
        assignActivity,
        setActivityDueDate,
        setActivityProject,
        kpis,
        isCommandOpen,
        setCommandOpen,
        commandQuery,
        setCommandQuery,
        selectedPartnerId,
        setSelectedPartnerId,
        selectedOrderId,
        setSelectedOrderId,
        selectedDocId,
        setSelectedDocId,
        selectedPrId,
        setSelectedPrId,
        highlightedJeId,
        setHighlightedJeId,
        isArDrilldownOpen,
        setIsArDrilldownOpen,
        isDemoPanelOpen,
        setIsDemoPanelOpen,
        toast,
        dismissToast,
        showToast,
        openRecord,
        syncOrderToAccounting,
        approvePurchaseRequest,
        advanceJournalEntryStep,
        addJournalEntry,
        triggerReplenishment,
        createSalesOrder,
        createPurchaseRequest,
        stampDocument,
        recordCustomAction,
        resetDemoState,
      }}
    >
      {children}
    </KizunaContext.Provider>
  );
};

export const useKizuna = () => {
  const ctx = useContext(KizunaContext);
  if (!ctx) throw new Error('useKizuna must be used within KizunaProvider');
  return ctx;
};
