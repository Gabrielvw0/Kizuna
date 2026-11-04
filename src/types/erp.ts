export type BranchId = 'ALL' | 'TOKYO' | 'OSAKA' | 'NAGOYA' | 'FUKUOKA';

export type SubLang = 'EN' | 'PT';

export type ModuleId =
  | 'activities'
  | 'dashboard'
  | 'analytics'
  | 'ai'
  | 'accounting'
  | 'procurement'
  | 'inventory'
  | 'sales'
  | 'partners'
  | 'documents'
  | 'workflow'
  | 'compliance'
  | 'audit'
  | 'hr'
  | 'production';

export type RecordType =
  | 'SO'
  | 'INV'
  | 'PARTNER'
  | 'CONTRACT'
  | 'PAYMENT'
  | 'JE'
  | 'PR'
  | 'PO'
  | 'ITEM'
  | 'DOC'
  | 'EMP';

export interface RelatedRecordRef {
  type: RecordType;
  id: string;
  titleJp: string;
  titleEn: string;
  titlePt: string;
  subtitle?: string;
  amount?: number;
  statusJp?: string;
  statusEn?: string;
  statusPt?: string;
}

export interface Partner {
  id: string;
  code: string;
  nameJp: string;
  nameEn: string;
  role: 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
  branch: BranchId;
  locationJp: string;
  locationEn: string;
  creditLimit: number;
  receivableBalance: number;
  payableBalance: number;
  rating: 'AAA' | 'AA' | 'A' | 'B+';
  contactPersonJp: string;
  contactPersonRomaji: string;
  departmentJp: string;
  email: string;
  phone: string;
  invoiceRegNo: string; // T + 13 digits (Qualified Invoice Issuer)
  sinceDate: string;
  contracts: string[];
  orders: string[];
  invoices: string[];
  payments: string[];
  journalEntries: string[];
}

export interface SalesOrder {
  id: string; // e.g. SO-2026-10482
  partnerId: string;
  partnerNameJp: string;
  partnerNameEn: string;
  branch: BranchId;
  date: string;
  deliveryDate: string;
  amount: number;
  stage: 'LEAD' | 'QUOTE' | 'ORDER' | 'SHIPPED' | 'INVOICED';
  statusJp: string;
  statusEn: string;
  statusPt: string;
  itemsSummaryJp: string;
  itemsSummaryEn: string;
  salesRepJp: string;
  invoiceId: string;
  contractId: string;
  journalEntryId?: string;
  accountingSynced: boolean;
}

export interface InvoiceRecord {
  id: string; // e.g. INV-2026-00389
  salesOrderId: string;
  partnerId: string;
  partnerNameJp: string;
  partnerNameEn: string;
  contractId: string;
  paymentId?: string;
  journalEntryId?: string;
  branch: BranchId;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  status: 'OPEN_AR' | 'PAID' | 'PENDING_SYNC' | 'OVERDUE';
  statusJp: string;
  statusEn: string;
  statusPt: string;
  accountingSynced: boolean;
}

export interface JournalEntry {
  id: string; // e.g. JE-2026-02841
  date: string;
  branch: BranchId;
  debitAccountJp: string;
  debitAccountEn: string;
  debitAccountPt: string;
  creditAccountJp: string;
  creditAccountEn: string;
  creditAccountPt: string;
  amount: number;
  summaryJp: string;
  summaryEn: string;
  summaryPt: string;
  workflowStep: 'SAVED' | 'VERIFIED' | 'APPROVED' | 'POSTED';
  relatedDocId: string;
  partnerId?: string;
  approvedByStamp: string;
}

export interface PurchaseRequestStep {
  key: 'REQUEST' | 'DEPT_APPROVAL' | 'PROC_APPROVAL' | 'PO_ISSUED' | 'RECEIVED';
  labelJp: string;
  labelEn: string;
  labelPt: string;
  state: 'DONE' | 'CURRENT' | 'PENDING';
  actorJp?: string;
  timestamp?: string;
  stampKanji?: string;
}

export interface PurchaseRequest {
  id: string; // e.g. PR-2026-00842
  requesterJp: string;
  requesterRomaji: string;
  departmentJp: string;
  departmentEn: string;
  departmentPt: string;
  supplierId: string;
  supplierNameJp: string;
  supplierNameEn: string;
  branch: BranchId;
  date: string;
  amount: number;
  titleJp: string;
  titleEn: string;
  titlePt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_ORDERED' | 'RECEIVED' | 'REJECTED';
  statusJp: string;
  statusEn: string;
  statusPt: string;
  poNumber?: string;
  relatedItemCode?: string;
  steps: PurchaseRequestStep[];
}

export interface InventoryItem {
  code: string; // KZ-00124
  nameJp: string;
  nameEn: string;
  namePt: string;
  categoryJp: string;
  warehouseJp: string;
  warehouseEn: string;
  branch: BranchId;
  stock: number;
  minStock: number;
  reserved: number;
  incoming: number;
  unitPrice: number;
  status: 'NORMAL' | 'WARNING' | 'OUT_OF_STOCK';
  supplierNameJp: string;
}

export interface DocumentItem {
  id: string; // CT-2026-0841
  docType: '見積書' | '注文書' | '請求書' | '領収書' | '契約書' | '納品書' | '稟議書' | '申請書';
  docTypeEn: string;
  docTypePt: string;
  titleJp: string;
  titleEn: string;
  partnerId: string;
  partnerNameJp: string;
  partnerNameEn: string;
  issueDate: string;
  expiryDate?: string;
  amount: number;
  status: 'VALID' | 'PENDING' | 'ARCHIVED';
  statusJp: string;
  statusEn: string;
  statusPt: string;
  relatedIds: string[];
  stamps: string[];
  ebpaCompliant: boolean; // 電子帳簿保存法
}

export interface AuditLogEntry {
  id: string;
  time: string;
  date: string;
  actorJp: string;
  actorRomaji: string;
  departmentJp: string;
  targetId: string;
  actionJp: string;
  actionEn: string;
  actionPt: string;
  detailJp: string;
  detailEn: string;
  detailPt: string;
  severity: 'INFO' | 'APPROVAL' | 'FINANCIAL' | 'SECURITY';
}

export interface EmployeeRecord {
  id: string;
  code: string;
  nameJp: string;
  nameRomaji: string;
  roleEn: string;
  roleJp: string;
  departmentJp: string;
  departmentEn: string;
  branch: BranchId;
  branchJp: string;
  joinDate: string;
  statusJp: string;
  stampKanji: string;
  email: string;
  grade: string;
}

// ---------------------------------------------------------------------------
// Kizuna Start: atividades, equipes e projetos (dados fictícios de demonstração)
// ---------------------------------------------------------------------------
export type TeamId = 'OPERACOES' | 'COMERCIAL' | 'ATENDIMENTO';

export type ActivityStatus = 'TODO' | 'DOING' | 'DONE';

export interface TeamMember {
  id: string;
  nameJp: string;
  nameRomaji: string;
  team: TeamId;
}

export interface ProjectRecord {
  id: string; // PRJ-001
  name: string;
  nameJp: string;
  teamId: TeamId;
}

export interface ActivityRecord {
  id: string; // ATV-0001
  title: string;
  assigneeId: string;
  dueDate: string; // AAAA-MM-DD
  status: ActivityStatus;
  projectId: string | null;
  createdAt: string; // AAAA-MM-DD
  completedAt?: string;
}
